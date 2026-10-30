'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Scan,
  UserCheck,
  Search,
  Camera,
  Image as ImageIcon,
  Keyboard,
  RotateCw,
  UploadCloud,
  Sparkles,
  Phone,
  Check,
  SwitchCamera,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getEvent, getVenue, formatDate, formatPrice, removeDiacritics } from '@/data/mockData';
import { BookingTicket } from '@/types';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'qrcode';

interface StaffTicketScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffTicketScannerModal({
  isOpen,
  onClose,
}: StaffTicketScannerModalProps) {
  const { tickets, checkInTicket } = useApp();

  const [scanMode, setScanMode] = useState<'camera' | 'manual' | 'file'>('camera');

  // Camera Management States
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [currentCameraIdx, setCurrentCameraIdx] = useState<number>(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [isScanPaused, setIsScanPaused] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Manual Mode States
  const [directCode, setDirectCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [manualFilter, setManualFilter] = useState<'active' | 'used' | 'all'>('active');

  // File / Image Mode States
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Check-in Verification Result Banner
  const [result, setResult] = useState<{
    type: 'success' | 'warning' | 'error' | null;
    message: string;
    ticket?: BookingTicket;
  }>({ type: null, message: '' });

  // Recent Check-in Logs
  const [recentCheckIns, setRecentCheckIns] = useState<
    Array<{ code: string; name: string; eventTitle: string; time: string }>
  >([]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isCooldownRef = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Audio synthesizer chime for instant confirmation
  const playBeep = (isSuccess = true) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = isSuccess ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(isSuccess ? 880 : 250, ctx.currentTime);
      if (isSuccess) {
        osc.frequency.exponentialRampToValueAtTime(1174, ctx.currentTime + 0.15); // A5 -> D6
      }
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio not supported or blocked
    }
  };

  // Core Verification & Check-in Handler
  const handleVerifyAndCheckIn = async (codeToVerify: string) => {
    const trimmed = codeToVerify.trim();
    if (!trimmed) return;

    const res = await checkInTicket(trimmed);

    if (res.ok && res.ticket) {
      playBeep(true);
      const event = getEvent(res.ticket.eventId);
      setResult({
        type: 'success',
        message: res.message,
        ticket: res.ticket,
      });
      setRecentCheckIns((prev) => [
        {
          code: res.ticket!.code,
          name: res.ticket!.name,
          eventTitle: event?.title || 'Sự kiện văn hóa',
          time: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        },
        ...prev.slice(0, 9),
      ]);
      setDirectCode('');
    } else if (res.ticket?.status === 'used') {
      playBeep(false);
      setResult({
        type: 'warning',
        message: res.message,
        ticket: res.ticket,
      });
    } else {
      playBeep(false);
      setResult({
        type: 'error',
        message: res.message,
        ticket: res.ticket,
      });
    }
  };

  const handleVerifyRef = useRef(handleVerifyAndCheckIn);
  useEffect(() => {
    handleVerifyRef.current = handleVerifyAndCheckIn;
  });

  // Resume camera scanning after a successful/warning scan
  const resumeCamera = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    try {
      if (html5QrCodeRef.current && scanMode === 'camera' && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.resume();
      }
    } catch {
      // ignore
    }
    isCooldownRef.current = false;
    setIsScanPaused(false);
    setResult({ type: null, message: '' });
  }, [scanMode]);

  // Handle single camera scan event with cooldown to prevent rapid fire loops
  const handleCameraScanSuccess = useCallback(async (decodedText: string) => {
    if (isCooldownRef.current) return;
    isCooldownRef.current = true;
    setIsScanPaused(true);

    // Freeze camera viewfinder frame temporarily
    try {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.pause(true);
      }
    } catch {
      // ignore
    }

    // Process ticket verification
    await handleVerifyRef.current(decodedText);

    // Auto-resume camera scanning after 3.5 seconds
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      resumeCamera();
    }, 3500);
  }, [resumeCamera]);

  // Switch between front and rear cameras
  const handleSwitchCamera = async () => {
    if (availableCameras.length <= 1) return;
    const nextIdx = (currentCameraIdx + 1) % availableCameras.length;
    setCurrentCameraIdx(nextIdx);
    const nextCamId = availableCameras[nextIdx].id;

    setIsCameraStarting(true);
    setIsCameraActive(false);

    try {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      }

      const scanner = new Html5Qrcode('staff-qr-camera-stream');
      html5QrCodeRef.current = scanner;

      const qrboxConfig = (viewfinderWidth: number, viewfinderHeight: number) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        const edge = Math.max(160, Math.floor(minEdge * 0.72));
        return { width: edge, height: edge };
      };

      await scanner.start(
        nextCamId,
        {
          fps: 15,
          qrbox: qrboxConfig,
          aspectRatio: 1.0,
        },
        (decodedText) => handleCameraScanSuccess(decodedText),
        () => {}
      );

      setIsCameraActive(true);
      setIsCameraStarting(false);
      isCooldownRef.current = false;
      setIsScanPaused(false);
    } catch {
      setIsCameraStarting(false);
      setCameraError('Không thể chuyển sang camera này.');
    }
  };

  // Camera Management Lifecycle Effect
  useEffect(() => {
    if (!isOpen || scanMode !== 'camera') {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current
            .stop()
            .then(() => {
              html5QrCodeRef.current?.clear();
              setIsCameraActive(false);
              setIsCameraStarting(false);
              setIsScanPaused(false);
            })
            .catch(() => {
              setIsCameraActive(false);
              setIsCameraStarting(false);
              setIsScanPaused(false);
            });
        }
      }
      return;
    }

    let isMounted = true;

    const initCamera = async () => {
      // Delay to ensure DOM is ready and prevent synchronous setState in effect
      await new Promise((r) => setTimeout(r, 120));
      if (!isMounted) return;

      setCameraError(null);
      setIsCameraStarting(true);
      setIsCameraActive(false);
      setIsScanPaused(false);

      try {
        if (html5QrCodeRef.current) {
          try {
            if (html5QrCodeRef.current.isScanning) {
              await html5QrCodeRef.current.stop();
            }
            html5QrCodeRef.current.clear();
          } catch {
            // ignore
          }
        }

        const scanner = new Html5Qrcode('staff-qr-camera-stream');
        html5QrCodeRef.current = scanner;

        let targetCamId: string | undefined;

        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            setAvailableCameras(devices);
            let backIdx = devices.findIndex((d) =>
              /back|rear|environment|sau|camera2 0/i.test(d.label)
            );
            if (backIdx === -1) {
              backIdx = devices.length - 1;
            }
            setCurrentCameraIdx(backIdx);
            targetCamId = devices[backIdx]?.id;
          }
        } catch {
          // ignore device enumeration errors
        }

        const qrboxConfig = (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const edge = Math.max(160, Math.floor(minEdge * 0.72));
          return { width: edge, height: edge };
        };

        const scanConfig = {
          fps: 15,
          qrbox: qrboxConfig,
          aspectRatio: 1.0,
        };

        try {
          if (targetCamId) {
            await scanner.start(
              targetCamId,
              scanConfig,
              (decodedText) => handleCameraScanSuccess(decodedText),
              () => {}
            );
          } else {
            await scanner.start(
              { facingMode: 'environment' },
              scanConfig,
              (decodedText) => handleCameraScanSuccess(decodedText),
              () => {}
            );
          }
        } catch {
          // Fallback retry with generic facingMode: environment
          await scanner.start(
            { facingMode: 'environment' },
            scanConfig,
            (decodedText) => handleCameraScanSuccess(decodedText),
            () => {}
          );
        }

        if (isMounted) {
          setIsCameraActive(true);
          setIsCameraStarting(false);
          isCooldownRef.current = false;
        }
      } catch (err: unknown) {
        if (isMounted) {
          setIsCameraActive(false);
          setIsCameraStarting(false);
          const errStr = err instanceof Error ? err.message : String(err);
          if (errStr.includes('NotAllowedError') || errStr.includes('Permission denied')) {
            setCameraError(
              'Trình duyệt chưa được cấp quyền Camera. Hãy cho phép quyền Camera trong cài đặt để quét vé.'
            );
          } else {
            setCameraError(
              'Không thể mở Camera sau. Bạn có thể bấm "Đổi Camera" hoặc dùng tab "Nhập mã".'
            );
          }
        }
      }
    };

    initCamera();

    return () => {
      isMounted = false;
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            html5QrCodeRef.current?.clear();
          })
          .catch(() => {});
      }
    };
  }, [isOpen, scanMode, handleCameraScanSuccess]);

  // Image QR Processor for File Upload / Drop / Paste / Demo
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFileError('Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, WEBP).');
      return;
    }

    setIsProcessingFile(true);
    setFileError(null);
    setResult({ type: null, message: '' });

    const previewUrl = URL.createObjectURL(file);
    setUploadedPreview(previewUrl);

    try {
      if (html5QrCodeRef.current?.isScanning) {
        try {
          await html5QrCodeRef.current.stop();
          html5QrCodeRef.current.clear();
          setIsCameraActive(false);
        } catch {
          // ignore
        }
      }

      await new Promise((r) => setTimeout(r, 400));

      const scanner = new Html5Qrcode('staff-qr-file-temp');
      const decodedText = await scanner.scanFile(file, false);
      scanner.clear();

      setIsProcessingFile(false);
      handleVerifyRef.current(decodedText);
    } catch {
      setIsProcessingFile(false);
      playBeep(false);
      setFileError(
        'Không tìm thấy mã QR hợp lệ trong ảnh này. Vui lòng chọn ảnh chụp rõ nét hơn hoặc chuyển sang tab "Nhập mã".'
      );
      setResult({
        type: 'error',
        message: 'Không nhận diện được mã QR từ hình ảnh tải lên.',
      });
    }
  };

  const processImageFileRef = useRef(processImageFile);
  useEffect(() => {
    processImageFileRef.current = processImageFile;
  });

  // Clipboard Paste Support (Ctrl + V) in Image QR Mode
  useEffect(() => {
    if (!isOpen || scanMode !== 'file') return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFileRef.current(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, scanMode]);

  // One-click Demo Test Ticket Generator
  const handleTestDemoQrImage = async () => {
    try {
      setIsProcessingFile(true);
      setFileError(null);

      const sampleTicket = tickets.find((t) => t.status === 'active') || tickets[0];
      if (!sampleTicket) {
        setFileError('Chưa có vé nào trong hệ thống để thử nghiệm.');
        setIsProcessingFile(false);
        return;
      }

      const qrPayload = `CULTURELINK-VERIFIED|${sampleTicket.code}|${sampleTicket.sessionId}`;
      const dataUrl = await QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#1E1035',
          light: '#FFFFFF',
        },
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `demo-ticket-${sampleTicket.code}.png`, {
        type: 'image/png',
      });

      await processImageFile(file);
    } catch (err) {
      console.error('Demo QR generation error:', err);
      setIsProcessingFile(false);
      setFileError('Không thể tạo mã QR demo.');
    }
  };

  if (!isOpen) return null;

  // Stats calculation
  const totalTickets = tickets.length;
  const usedTickets = tickets.filter((t) => t.status === 'used').length;
  const activeTickets = tickets.filter((t) => t.status === 'active').length;
  const cancelledTickets = tickets.filter((t) => t.status === 'cancelled').length;

  // Manual Mode: Filtered tickets by search query
  const filteredTickets = tickets.filter((t) => {
    if (manualFilter === 'active' && t.status !== 'active') return false;
    if (manualFilter === 'used' && t.status !== 'used') return false;

    const q = searchQuery.trim();
    if (!q) return true;

    const cleanQ = removeDiacritics(q.toLowerCase());
    const codeMatch = t.code.toLowerCase().includes(cleanQ);
    const nameMatch = removeDiacritics(t.name.toLowerCase()).includes(cleanQ);
    const phoneMatch = t.phone.toLowerCase().includes(cleanQ);
    const event = getEvent(t.eventId);
    const eventMatch = event ? removeDiacritics(event.title.toLowerCase()).includes(cleanQ) : false;

    return codeMatch || nameMatch || phoneMatch || eventMatch;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 md:p-4 animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-card rounded-[26px] shadow-2xl border border-border/60 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Off-screen Container for File Scanner Worker */}
        <div
          id="staff-qr-file-temp"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            opacity: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5 bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-primary-foreground shadow-xs">
              <Scan className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm md:text-base">Soát vé vào cổng (Staff Check-in)</h3>
              <p className="text-[11px] text-muted-foreground">
                Quét Camera sau · Nhập mã nhanh · Đối soát Ban tổ chức
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-5 space-y-3.5 overflow-y-auto flex-1">
          {/* Real-time Event Stats Cards */}
          <div className="grid grid-cols-4 gap-2 text-center shrink-0">
            <div className="rounded-2xl bg-muted/40 p-2 border border-border/40">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Tổng vé</p>
              <p className="text-base md:text-lg font-bold text-foreground mt-0.5">{totalTickets}</p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-2 border border-emerald-500/20">
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold">Đã vào</p>
              <p className="text-base md:text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{usedTickets}</p>
            </div>
            <div className="rounded-2xl bg-indigo-500/10 p-2 border border-indigo-500/20">
              <p className="text-[10px] text-indigo-700 dark:text-indigo-400 uppercase font-bold">Chưa đến</p>
              <p className="text-base md:text-lg font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">{activeTickets}</p>
            </div>
            <div className="rounded-2xl bg-rose-500/10 p-2 border border-rose-500/20">
              <p className="text-[10px] text-rose-700 dark:text-rose-400 uppercase font-bold">Đã hủy</p>
              <p className="text-base md:text-lg font-bold text-rose-700 dark:text-rose-400 mt-0.5">{cancelledTickets}</p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-secondary/80 p-1 border border-border/40 shrink-0">
            <button
              type="button"
              onClick={() => {
                setScanMode('camera');
                setResult({ type: null, message: '' });
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                scanMode === 'camera'
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Camera className="h-3.5 w-3.5 text-brand" />
              <span>Camera sau</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScanMode('manual');
                setResult({ type: null, message: '' });
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                scanMode === 'manual'
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Keyboard className="h-3.5 w-3.5 text-brand" />
              <span>Nhập mã</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScanMode('file');
                setResult({ type: null, message: '' });
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                scanMode === 'file'
                  ? 'bg-card text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5 text-brand" />
              <span>Ảnh QR</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: Camera Scanner Mode (Optimized for Mobile Rear Cam) */}
          {/* ======================================================== */}
          {scanMode === 'camera' && (
            <div className="space-y-3">
              <div className="relative w-full aspect-square max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-black/95 border-2 border-border/80 flex items-center justify-center shadow-inner">
                {/* HTML5 QR Camera Video Stream Container */}
                <div id="staff-qr-camera-stream" className="w-full h-full" />

                {/* Animated Scan Reticle */}
                {isCameraActive && !isScanPaused && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-dashed border-emerald-400 rounded-2xl relative shadow-lg">
                      <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_#34d399] animate-bounce top-1/2" />
                    </div>
                  </div>
                )}

                {/* Scanned / Paused View Overlay */}
                {isCameraActive && isScanPaused && (
                  <div className="pointer-events-none absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                    <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-in zoom-in-50 duration-200" />
                    <p className="text-xs font-bold mt-1">Đã nhận diện mã vé!</p>
                  </div>
                )}

                {/* Camera Starting Spinner */}
                {isCameraStarting && (
                  <div className="absolute text-center p-4 text-white/90 space-y-2">
                    <RotateCw className="h-8 w-8 animate-spin mx-auto text-emerald-400" />
                    <p className="text-xs font-medium">Đang kích hoạt Camera sau…</p>
                  </div>
                )}

                {/* Camera Error View */}
                {cameraError && !isCameraStarting && (
                  <div className="absolute inset-0 bg-card p-4 flex flex-col items-center justify-center text-center space-y-2.5">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                    <p className="text-xs text-foreground font-medium max-w-xs">{cameraError}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCameraError(null);
                          setIsCameraStarting(true);
                          setTimeout(() => {
                            if (html5QrCodeRef.current?.isScanning) {
                              html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current?.clear()).catch(() => {});
                            }
                            const scanner = new Html5Qrcode('staff-qr-camera-stream');
                            html5QrCodeRef.current = scanner;
                            scanner.start(
                              { facingMode: 'environment' },
                              { fps: 15, qrbox: { width: 200, height: 200 } },
                              (decodedText) => handleCameraScanSuccess(decodedText),
                              () => {}
                            ).then(() => {
                              setIsCameraActive(true);
                              setIsCameraStarting(false);
                            }).catch((err) => {
                              setIsCameraStarting(false);
                              setCameraError(String(err));
                            });
                          }, 100);
                        }}
                        className="rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Thử lại</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setScanMode('manual')}
                        className="rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        Nhập mã
                      </button>
                    </div>
                  </div>
                )}

                {/* Camera Switcher Button on top right of video */}
                {isCameraActive && availableCameras.length > 1 && (
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    title="Đổi camera trước / sau"
                    className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 text-xs flex items-center gap-1 backdrop-blur-xs transition-colors cursor-pointer border border-white/20 shadow-md"
                  >
                    <SwitchCamera className="h-4 w-4" />
                    <span className="text-[10px] hidden sm:inline">Đổi Cam</span>
                  </button>
                )}
              </div>

              {/* Instant Action Button when scanned */}
              {result.type && (
                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={resumeCamera}
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Quét vé tiếp theo</span>
                  </button>
                </div>
              )}

              <p className="text-center text-[11px] text-muted-foreground">
                Hướng camera sau vào mã QR trên điện thoại hoặc vé in của khách hàng
              </p>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: Manual Input & Search Mode (Rock-Solid Check-in) */}
          {/* ======================================================== */}
          {scanMode === 'manual' && (
            <div className="space-y-4">
              {/* Box 1: Direct Ticket Code Entry */}
              <div className="rounded-2xl border border-brand/30 bg-brand/5 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="staff-direct-code-input" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Keyboard className="h-3.5 w-3.5 text-brand" />
                    <span>Soát vé bằng mã trực tiếp</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground">Hỗ trợ gõ nhanh (VD: 88A2F1 hoặc CL-88A2F1)</span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (directCode.trim()) {
                      handleVerifyAndCheckIn(directCode);
                    }
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      id="staff-direct-code-input"
                      type="text"
                      value={directCode}
                      onChange={(e) => setDirectCode(e.target.value.toUpperCase())}
                      placeholder="Gõ mã vé (VD: CL-88A2F1 hoặc 88A2F1)…"
                      className="w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm font-mono font-bold tracking-wider text-foreground placeholder:font-sans placeholder:font-normal placeholder:text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand uppercase"
                    />
                    {directCode && (
                      <button
                        type="button"
                        onClick={() => setDirectCode('')}
                        aria-label="Xóa mã"
                        className="absolute right-2.5 top-3 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!directCode.trim()}
                    className="flex items-center gap-1.5 rounded-2xl bg-brand px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shrink-0"
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Check-in</span>
                  </button>
                </form>

                {/* Quick 1-Click Code Test Pills */}
                {activeTickets > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-muted-foreground font-medium">Bấm thử nhanh:</span>
                    {tickets
                      .filter((t) => t.status === 'active')
                      .slice(0, 3)
                      .map((t) => (
                        <button
                          key={t.code}
                          type="button"
                          onClick={() => {
                            setDirectCode(t.code);
                            handleVerifyAndCheckIn(t.code);
                          }}
                          className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[11px] font-mono font-semibold text-brand border border-brand/30 hover:bg-brand/10 transition-colors cursor-pointer shadow-2xs"
                        >
                          <span>{t.code}</span>
                          <span className="text-[9px] text-muted-foreground font-sans">({t.name})</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Box 2: Lookup by Attendee Name / Phone & Filterable List */}
              <div className="space-y-2.5 pt-1 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Tra cứu khán giả & SĐT</span>
                  </p>
                  {/* Status Filter Chips */}
                  <div className="flex gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setManualFilter('active')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                        manualFilter === 'active'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/40'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Chờ vào ({activeTickets})
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualFilter('used')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                        manualFilter === 'used'
                          ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500/40'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Đã vào ({usedTickets})
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualFilter('all')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                        manualFilter === 'all'
                          ? 'bg-brand/20 text-brand ring-1 ring-brand/40'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Tất cả ({totalTickets})
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên khán giả, SĐT (VD: An, 0903123456)…"
                    className="w-full rounded-xl border border-border bg-card pl-8 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Xóa tìm kiếm"
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* List of matching tickets */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                  {filteredTickets.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/70 p-4 text-center space-y-1 bg-muted/10">
                      <p className="text-xs text-foreground font-medium">
                        {searchQuery.trim()
                          ? `Không tìm thấy vé nào phù hợp với "${searchQuery}".`
                          : 'Không có vé nào trong mục này.'}
                      </p>
                    </div>
                  ) : (
                    filteredTickets.map((t) => {
                      const event = getEvent(t.eventId);
                      const venue = getVenue(event?.venueId || '');
                      const session = event?.sessions.find((s) => s.id === t.sessionId);
                      const isTicketActive = t.status === 'active';

                      return (
                        <div
                          key={t.code}
                          className={`rounded-xl p-2.5 border transition-all flex items-center justify-between gap-2.5 ${
                            isTicketActive
                              ? 'bg-card border-border hover:border-brand/40 shadow-xs'
                              : 'bg-muted/30 border-border/40 opacity-75'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-brand/10 text-brand">
                                {t.code}
                              </span>
                              <span className="text-xs font-bold text-foreground truncate">
                                {t.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Phone className="h-2.5 w-2.5" />
                                {t.phone}
                              </span>
                            </div>

                            <p className="text-[11px] text-foreground font-medium line-clamp-1">
                              {event?.title || 'Sự kiện văn hóa'}
                            </p>

                            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                              <span>{venue.name}</span>
                              <span>•</span>
                              <span>{formatDate(session?.start || t.createdAt)}</span>
                              <span>•</span>
                              <span>{t.qty} vé ({formatPrice(t.total)})</span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isTicketActive ? (
                              <button
                                type="button"
                                onClick={() => handleVerifyAndCheckIn(t.code)}
                                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                              >
                                <Check className="h-3 w-3 stroke-[3]" />
                                <span>Check-in</span>
                              </button>
                            ) : t.status === 'used' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                                <CheckCircle2 className="h-3 w-3" />
                                Đã vào
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded">
                                <XCircle className="h-3 w-3" />
                                Đã hủy
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: Image / Screenshot QR Scanner Mode */}
          {/* ======================================================== */}
          {scanMode === 'file' && (
            <div className="space-y-3.5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processImageFile(file);
                }}
                className={`relative rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                  isDragging
                    ? 'border-brand bg-brand/10 scale-[1.01]'
                    : 'border-border/80 bg-muted/10 hover:border-brand/40'
                }`}
              >
                {uploadedPreview ? (
                  <div className="space-y-2.5">
                    <div className="relative w-40 h-40 mx-auto rounded-2xl overflow-hidden border border-border shadow-md bg-black/5 flex items-center justify-center">
                      <img
                        src={uploadedPreview}
                        alt="Ảnh vé QR tải lên"
                        className="w-full h-full object-contain"
                      />

                      {isProcessingFile && (
                        <div className="pointer-events-none absolute inset-0 flex flex-col justify-center">
                          <div className="w-full h-1 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce" />
                        </div>
                      )}

                      {isProcessingFile && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-1">
                          <RotateCw className="h-5 w-5 animate-spin text-emerald-400" />
                          <p className="text-[10px] font-medium">Đang giải mã QR…</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <label className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer border border-border/60">
                        <UploadCloud className="h-3.5 w-3.5 text-brand" />
                        <span>Chọn ảnh khác</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) processImageFile(f);
                          }}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setUploadedPreview(null);
                          setFileError(null);
                          setResult({ type: null, message: '' });
                        }}
                        className="rounded-full bg-muted/60 px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-brand/10 mx-auto text-brand">
                      <UploadCloud className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Kéo thả ảnh vé hoặc nhấp chọn tệp
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Hỗ trợ PNG, JPG, WEBP hoặc ảnh chụp màn hình vé QR
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Chọn ảnh từ thiết bị</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) processImageFile(file);
                        }}
                        className="hidden"
                      />
                    </label>

                    <p className="text-[10px] text-muted-foreground italic pt-0.5">
                      💡 Mẹo: Nhấn <strong>Ctrl + V</strong> để dán ảnh chụp màn hình tức thì!
                    </p>
                  </div>
                )}
              </div>

              {/* Demo Test Button */}
              <div className="rounded-xl bg-brand/5 border border-brand/20 p-2.5 flex items-center justify-between gap-2.5">
                <div className="text-left space-y-0.5">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Dùng vé mẫu để thử ngay</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Tạo ảnh QR tự động từ vé thực tế để thử giải mã ảnh
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTestDemoQrImage}
                  disabled={isProcessingFile}
                  className="shrink-0 rounded-lg bg-brand/10 hover:bg-brand/20 text-brand px-3 py-1.5 text-xs font-bold border border-brand/30 transition-colors cursor-pointer"
                >
                  Quét vé demo
                </button>
              </div>

              {fileError && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* Prominent Verification Result Banner */}
          {/* ======================================================== */}
          {result.type && (
            <div
              className={`rounded-2xl p-3.5 border animate-in zoom-in-95 duration-150 ${
                result.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 shadow-sm'
                  : result.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-100'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-100'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {result.type === 'success' && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {result.type === 'warning' && (
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                {result.type === 'error' && (
                  <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 space-y-1">
                  <p className="font-bold text-xs md:text-sm">{result.message}</p>

                  {result.ticket && (
                    <div className="text-xs space-y-0.5 pt-0.5 opacity-90 border-t border-current/15 mt-1">
                      <p>
                        <b>Mã vé:</b> <span className="font-mono font-bold">{result.ticket.code}</span>
                      </p>
                      <p>
                        <b>Khách hàng:</b> {result.ticket.name} ({result.ticket.phone || 'Chính chủ'}) · {result.ticket.qty} vé
                      </p>
                      <p>
                        <b>Sự kiện:</b> {getEvent(result.ticket.eventId)?.title}
                      </p>
                      <p>
                        <b>Địa điểm:</b> {getVenue(getEvent(result.ticket.eventId)?.venueId || '')?.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* Recent Check-in Logs */}
          {/* ======================================================== */}
          <div className="space-y-1.5 pt-2 border-t border-border/50">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-brand" />
              <span>Lịch sử ca trực vừa qua ({recentCheckIns.length})</span>
            </h4>

            {recentCheckIns.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic py-1">
                Chưa có lượt soát vé nào trong ca này.
              </p>
            ) : (
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/30">
                {recentCheckIns.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 text-xs">
                    <div>
                      <p className="font-bold text-foreground">{log.name}</p>
                      <p className="text-[10px] text-muted-foreground">{log.eventTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-emerald-600 font-bold">{log.code}</span>
                      <p className="text-[10px] text-muted-foreground">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 border-t border-border/40 p-2.5 text-center shrink-0">
          <p className="text-[10px] text-muted-foreground">
            Hệ thống đối soát vé thời gian thực · CultureLink Security HMAC & VietQR
          </p>
        </div>
      </div>
    </div>
  );
}
