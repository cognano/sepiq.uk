"use client";

import { useEffect, useRef } from "react";
import styles from "./FloatingCircles.module.css";

interface Circle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  color: string;
}

const LIGHT_COLORS = [
  "#903f22",
  "#05668d",
  "#b85c38",
  "#05668d",
  "#903f22",
  "#3a86a8",
  "#c46a4a",
];

const DARK_COLORS = [
  "#e07a5f",
  "#6bb8d9",
  "#d4956a",
  "#6bb8d9",
  "#e07a5f",
  "#8ecae6",
  "#e8a87c",
];

export default function FloatingCircles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const circlesRef = useRef<Circle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    circlesRef.current = Array.from({ length: 7 }, () => {
      const radius = Math.random() * 80 + 40;
      return {
        x: Math.random() * (canvas.width - 2 * radius) + radius,
        y: Math.random() * (canvas.height - 2 * radius) + radius,
        radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
      };
    });

    function drawCircle(circle: Circle) {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = circle.color;
      ctx.fill();
      ctx.closePath();
    }

    function updateCircle(circle: Circle) {
      if (!canvas) return;
      circle.x += circle.dx;
      circle.y += circle.dy;

      if (
        circle.x + circle.radius > canvas.width ||
        circle.x - circle.radius < 0
      ) {
        circle.dx = -circle.dx;
      }

      if (
        circle.y + circle.radius > canvas.height ||
        circle.y - circle.radius < 0
      ) {
        circle.dy = -circle.dy;
      }
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const circle of circlesRef.current) {
        drawCircle(circle);
        updateCircle(circle);
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className={styles.container} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
