import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import "@fontsource/dancing-script";
import "@fontsource/pacifico";
import "@fontsource/roboto";
import "@fontsource/courier-prime";
import "@fontsource/great-vibes";  
import "@fontsource/domine";

const Photobooth = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null); 
  const [photos, setPhotos] = useState([]);
  const [originalPhotos, setOriginalPhotos] = useState([]);
  const [captions, setCaptions] = useState("");
  const [timer, setTimer] = useState(3);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedFrameColor, setSelectedFrameColor] = useState("#ff69b4");
  const [selectedEffect, setSelectedEffect] = useState("");
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [selectedFontSize, setSelectedFontSize] = useState("16px");
  const [isFinished, setIsFinished] = useState(false);
  const [background, setBackground] = useState("linear-gradient(to right, #fbc2eb, #a6c1ee)");
  const [isMirrored, setIsMirrored] = useState(false); 
  const [countdownProgress, setCountdownProgress] = useState(0); 

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" } 
      });      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Gagal akses kamera:", err);
      alert("Gagal akses kamera! Coba cek permission atau buka di HTTPS.");
    }
  };

  const capturePhoto = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      let photoURL = canvas.toDataURL("image/png");
      setPhotos((prevPhotos) => [...prevPhotos, photoURL]);
      setOriginalPhotos((prevPhotos) => [...prevPhotos, photoURL]);
    }
  };

  const startCaptureSequence = () => {
    if (isCapturing || photos.length >= 4) return;
    setIsCapturing(true);
    let count = 0;

    const interval = setInterval(() => {
      if (count < 4) {
        setTimer(3);
        setCountdownProgress(100); 
        const countdown = setInterval(() => {
          setTimer((prev) => (prev > 1 ? prev - 1 : 0));
          setCountdownProgress((prev) => prev - 33.33); 
        }, 1000);

        setTimeout(() => {
          clearInterval(countdown);
          capturePhoto();
          count++;
        }, 3000);
      } else {
        clearInterval(interval);
        setIsCapturing(false);
        setIsFinished(true);
      }
    }, 3500);
  };

  const downloadPhoto = async () => {
    const collage = document.getElementById("photo-collage");
    const canvas = await html2canvas(collage);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "photobooth.png";
    link.click();
  };

  const resetPhotobooth = () => {
    setPhotos([]);
    setCaptions("");
    setIsFinished(false);
    setSelectedEffect("");
    setOriginalPhotos([]);
  };

  const applyEffect = (photo, effect) => {
    if (!effect) return photo;
  
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "Anonymous"; 
    img.src = photo;
  
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.filter = effect;  // Terapkan efek
        context.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
    });
  };
  
  const applyEffectsToPhotos = async () => {
    if (!selectedEffect) {
      setPhotos(originalPhotos);
      return;
    }
  
  
    const processedPhotos = await Promise.all(
      originalPhotos.map((photo) => applyEffect(photo, selectedEffect))
    );
    setPhotos(processedPhotos);
  };
  

  const gradients = [
    "linear-gradient(120deg, #f6d365, #fda085)", 
    "linear-gradient(120deg, #84fab0, #8fd3f4)", 
    "linear-gradient(120deg, #a6c0fe, #f68084)", 
    "linear-gradient(120deg, #fccb90, #d57eeb)", 
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBackground((prev) => {
        const nextIndex = (gradients.indexOf(prev) + 1) % gradients.length;
        return gradients[nextIndex];
      });
    }, 6000); 
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    applyEffectsToPhotos();
  }, [selectedEffect]);  
  
  const applyFontSettings = () => ({
    fontFamily: selectedFont,
    fontSize: selectedFontSize,
  });

      return (
        <div
      style={{
        minHeight: "100vh",
        transition: "background 1s ease-in-out",
        background: background, 
      }}
      className="flex justify-center items-center p-6"
    >
      <div className="flex flex-col lg:flex-row items-start bg-white shadow-lg rounded-lg p-4 max-w-full w-full">
        <div className="flex flex-col items-center mr-6">
        <h1 className="text-3xl text-pink-600 mb-6 font-bold font-[Pacifico]">Christy Photobooth</h1>
        <video
          ref={videoRef}
          autoPlay
          playsInline  
          className="border rounded mb-2 w-[320px] h-[240px]"
          style={{ transform: isMirrored ? "scaleX(-1)" : "none" }} 
        />

        <button
          onClick={startCaptureSequence}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full shadow-lg hover:from-purple-500 hover:to-pink-500 transition-all mb-4 w-full text-sm"
          disabled={isCapturing || photos.length >= 4}
        >
          Mulai Foto
        </button>

      <div className="relative flex items-center justify-center w-[40px] h-[40px] mb-6"> 
        <svg
          className="w-[60px] h-[60px] animate-spin-slow"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          style={{
            transform: `rotate(${(3 - timer) * 360}deg)`,
            transition: "transform 1s ease-out",
          }}
        >
          <circle cx="50" cy="50" r="45" stroke="#ccc" strokeWidth="3" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#ff69b4"
            strokeWidth="3"
            fill="none"
            strokeDasharray="283"
            strokeDashoffset={(countdownProgress / 100) * 283}
            style={{
              transition: "stroke-dashoffset 1s ease-out",
            }}
          />
        </svg>
        <div>
       
        <span
        className="absolute text-sm text-pink-600"
        style={{
          top: "50%",         
          left: "50%",        
          transform: "translate(-50%, -50%)" 
        }}
      >
        {timer}
      </span>
      </div>

      </div>
          <label className="mt-4">
            <input
              type="checkbox"
              checked={isMirrored}
              onChange={(e) => setIsMirrored(e.target.checked)}
              className="mr-2"
            />
            Cermin Kamera
          </label>
        </div>
        <div
        id="photo-collage"
        className="relative flex flex-col items-center bg-white p-2 pb-8 rounded-lg mr-4 min-h-[400px]"
        style={{ borderColor: selectedFrameColor }}
      >

{photos.map((photo, index) => (
  <img
    key={index}
    src={photo}
    alt={`Foto ${index + 1}`}
    className="border mb-2 w-[160px] h-[120px] rounded-2xl shadow-md"
    style={{ borderColor: selectedFrameColor, borderWidth: "2px" }}
  />
))}

<div className="text-center mt-[-2px] mb-0 overflow-visible caption-print">
  <p
    style={{
      color: selectedFrameColor,
      fontFamily: selectedFont,
      fontSize: selectedFontSize,
      whiteSpace: "nowrap",
      overflow: "visible",
      textOverflow: "ellipsis",
      textAlign: "center",
      marginTop: "-5px",
    }}
  >
    {captions}
  </p>
</div>

      </div>
        <div className="flex flex-col items-center ml-4 space-y-4 p-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg shadow-lg w-[300px]">
          <label className="text-lg font-semibold mb-2">Pilih Efek:</label>
          <select
              onChange={(e) => setSelectedEffect(e.target.value)}
              className="border rounded p-2 w-full mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
              value={selectedEffect}
            >
              <option value="">Normal</option>  
              <option value="grayscale(100%)">Grayscale</option>
              <option value="sepia(100%)">Sepia</option>
              <option value="contrast(200%)">Kontras</option>
              <option value="brightness(120%)">Percantik</option>
              <option value="saturate(150%)">Warna Tajam</option>
              <option value="blur(2px)">Halus</option>
            </select>

          <label className="text-lg font-semibold mb-2">Pilih Warna Frame:</label>
          <input
            type="color"
            value={selectedFrameColor}
            onChange={(e) => setSelectedFrameColor(e.target.value)}
            className="w-full mb-4 p-2 rounded-lg border focus:outline-none"
          />

          <label className="text-lg font-semibold mb-2">Pilih Font:</label>
          <select
            onChange={(e) => setSelectedFont(e.target.value)}
            className="border rounded p-2 w-full mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            value={selectedFont}
          >
            <option value="Arial">Arial</option>
            <option value="'Dancing Script', cursive">Dancing Script</option>
            <option value="'Pacifico', cursive">Pacifico</option>
            <option value="'Roboto', sans-serif">Roboto</option>
            <option value="'Domine', serif">Domine</option>
            <option value="'Courier Prime', monospace">Courier Prime</option>
            <option value="'Great Vibes', cursive">Great Vibes</option>  
          </select>

          <label className="text-lg font-semibold mb-2">Tulis Caption:</label>
          <input
            type="text"
            value={captions}
            onChange={(e) => setCaptions(e.target.value)}
            className="border rounded p-2 w-full mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
          />

          <select onChange={(e) => setSelectedFontSize(e.target.value)} className="mb-4">
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="20px">20px</option>
            <option value="30px">30px</option>
            <option value="40px">40px</option>
            <option value="60px">60px</option>
          </select>
          <p style={applyFontSettings()}>{captions}</p>

          <button
            onClick={downloadPhoto}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={photos.length < 4}
          >
            Download
          </button>

          <button
            onClick={resetPhotobooth}
            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
          >
            Reset
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" width="640" height="480"></canvas>
    </div>
  );
};

export default Photobooth;
