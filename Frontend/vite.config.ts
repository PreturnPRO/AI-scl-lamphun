import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  // โหลดค่า Environment Variables
  const env = loadEnv(mode, process.cwd(), '');

  // 🛑 ดักจับ: ลองปริ้นท์ URL ออกมาดูใน Terminal ซิ ว่าอ่านเจอไหม?
  console.log('--------------------------------------------------');
  console.log(' TARGET URL:', env.VITE_API_ENDPOINT); // ถ้าตรงนี้ว่างเปล่า หรือ undefined แปลว่าอ่าน .env ไม่ได้
  console.log('--------------------------------------------------');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api-tidb': {
          target: env.VITE_API_ENDPOINT,
          changeOrigin: true,
          secure: false, // เพิ่มบรรทัดนี้: ช่วยเรื่อง SSL บางที HTTPS เรื่องมาก
          rewrite: (path) => path.replace(/^\/api-tidb/, ''),
          // ให้โชว์ Log การยิง Proxy ใน Terminal
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log(' Proxy Error:', err);
            });
            proxy.on('proxyReq', (_proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(' Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
  }
})