# ==========================================
# Stage 1: Build Environment 
# ==========================================
FROM oven/bun:1 AS build

WORKDIR /app

# 1. ก๊อปปี้ไฟล์รายชื่อไลบรารี่มาก่อน เพื่อใช้ประโยชน์จาก Layer Cache
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 2. เอาโค้ดทั้งหมดเข้ามา
COPY . .

# 3. สั่ง Build ให้กลายเป็น Static Files 
# (ตรวจสอบใน vite.config.ts อีกทีนะครับว่าโฟลเดอร์ผลลัพธ์ชื่อ dist ใช่ไหม)
RUN bun run build

# ==========================================
# Stage 2: Production Environment (ใช้ Nginx เป็นคนเสิร์ฟ)
# ==========================================
FROM nginx:alpine

# 4. ก๊อปปี้แค่ไฟล์ Static ที่ Build เสร็จแล้วจาก Stage 1 มาใส่ในโฟลเดอร์ที่ Nginx ใช้เสิร์ฟเว็บ
COPY --from=build /app/dist /usr/share/nginx/html

# 5. ก๊อปปี้ไฟล์ตั้งค่า nginx.conf ของเรา ไปทับไฟล์ Default ของระบบ Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 6. เปิดพอร์ต 80 (พอร์ตมาตรฐานของ HTTP)
EXPOSE 80

# 7. สั่งให้ Nginx ทำงานแบบ Background
CMD ["nginx", "-g", "daemon off;"]