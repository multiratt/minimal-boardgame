# ♟️ Minimal Checkers (หมากฮอสสากลมินิมอล ขาว-ดำ)

เว็บแอปพลิเคชันเล่นหมากฮอสสากล (Standard Checkers 8x8) สไตล์ Monochrome Minimalist คอนทราสต์ขาว-ดำ ดีไซน์เรียบหรู พร้อมแอนิเมชันการเดิน การกินทำลายเบี้ย และการเปลี่ยนร่างเป็นฮอส (King) รองรับการเล่นกับบอท AI (3 ระดับ) และระบบออนไลน์ 6 ห้องสดพร้อมโหมดผู้ชม (Spectator Mode) รันบน GitHub Pages ได้ 100% โดยไม่ต้องพึ่งพาเซิร์ฟเวอร์ส่วนตัว

🔗 **เข้าเล่นทันทีผ่าน GitHub Pages:** [https://multiratt.github.io/minimal-checkers/](https://multiratt.github.io/minimal-checkers/)

---

## ✨ จุดเด่นและคุณสมบัติ (Features)

* **🎨 สไตล์ Monochrome Minimalist:**
  * โทนสีขาว ดำ เทา คอนทราสต์คมชัดแบบ High-Contrast สบายตา
  * ตัวหมากทรงกลมเรขาคณิตพร้อมลวดลายวงแหวนมินิมอล
  * สัญลักษณ์มงกุฎเรขาคณิตคมชัดสำหรับตัวฮอส (King)
* **🎬 Kinetic Animations (ระบบแอนิเมชัน):**
  * **Move Animation (ตอนเดิน):** ตัวหมากสไลด์แบบ Smooth Translation สู่ช่องเป้าหมายอย่างนุ่มนวล
  * **Capture & Destroy (ตอนโดนทำลาย):** จังหวะถูกกิน ตัวหมากจะสว่างขึ้น ยุบตัวลง (Scale down) พร้อมเกิดคลื่นวงแหวน Shockwave กระจายตัวสลายหายไป
  * **King Promotion (การแปลงเป็น horse/ฮอส):** ตัวหมากหมุน Flip 3D (360°), ขยายร่าง Pulse เปล่งแสง และปรากฏมงกุฎทองคำขาวพร้อมวงแหวนเรืองแสง
* **🌐 ระบบ 2 ภาษา (Bilingual Support):**
  * สลับภาษา **ไทย (TH)** หรือ **อังกฤษ (EN)** ได้ทันทีแบบ Real-time
  * จดจำการตั้งค่าภาษาใน Browser LocalStorage
* **🤖 Bot AI ปรับความยากได้ 3 ระดับ:**
  * **ง่าย (Easy):** เดินเร็ว มีจังหวะเดินพลาด เหมาะสำหรับผู้เริ่มต้น
  * **ปานกลาง (Medium):** Minimax ความลึก 3 ชั้น ดักทางและคุมพื้นที่กลางกระดาน
  * **ยาก (Hard):** Minimax + Alpha-Beta Pruning ความลึก 5 ชั้น พร้อม Positional Piece-Square Tables และการรักษาแนวหลัง
  * คำนวณผ่าน **Web Worker** แยกเธรด ทำให้หน้าจอและแอนิเมชันลื่นไหล 60 FPS เสมอ
* **⚡ เล่นออนไลน์ 6 ห้อง & โหมดผู้ชม (100% GitHub Pages Real-time):**
  * **ไม่ต้องสมัครบัญชี:** เพียงพิมพ์ชื่อเล่น (Nickname) แล้วเลือกห้องเล่นได้ทันที
  * **Lobby 6 ห้องสด:** แสดงสถานะ Real-time:
    * 🟢 **ห้องว่าง (0/2)**
    * 🟡 **รอผู้เล่นคนที่ 2 (1/2)** — แสดงชื่อผู้เล่นที่กำลังรอ
    * ⚫ **กำลังแข่งขัน (2/2)** — แสดงชื่อผู้เล่นทั้งสองฝั่ง
  * **โหมดผู้ชม (Spectator Mode):** ทุกคนสามารถกด **"เข้าชมการแข่งขัน (Spectate)"** เพื่อดูการเดินสดแบบ Real-time ได้ตลอดเวลา
  * สถาปัตยกรรม **Hybrid MQTT over Secure WebSocket + Local BroadcastChannel** รองรับทั้งการเล่นข้ามอินเทอร์เน็ตและการทดสอบหลายแท็บบนเครื่องเดียวกัน
* **⏱️ ตัวจับเวลานับถอยหลังต่อตา (Turn Countdown Timer):**
  * จับเวลาต่อตา (30 วินาที) พร้อม Progress Bar มินิมอล
  * เสียงติ๊กเตือนช่วง 5 วินาทีสุดท้าย และปรับแพ้ (Timeout Forfeit) ทันทีหากเวลาหมด
* **🔊 เสียงสังเคราะห์ Procedural SFX (Web Audio API):**
  * เสียงคลิกเดินหมาก, เสียงกินหมาก, เสียงบรรลุเป็นฮอส, เสียงเตือนเวลา และเสียงฉลองชัยชนะ สังเคราะห์ด้วยโค้ดล้วน โหลดไว ไม่มี 404 สามารถกดเปิด/ปิดเสียงได้

---

## 📜 กติกาสากล (Standard Checkers Rules)

1. กระดานขนาด 8x8 ช่อง เล่นเฉพาะบนช่องสีเข้ม (ฝั่งละ 12 ตัว โดยฝ่ายสีขาวเดินก่อน)
2. เบี้ยธรรมดาเดินทแยงไปข้างหน้า 1 ช่อง และกินทแยงหน้าข้ามตัวหมากฝ่ายตรงข้าม
3. **การบังคับกิน (Mandatory Jump):** หากมีจังหวะกิน กติกากำหนดให้ต้องกิน และสามารถกินต่อเนื่องได้ (Multi-jump)
4. **การเป็นฮอส (King Promotion):** เมื่อเบี้ยเดินไปถึงแถวหลังสุดของฝั่งตรงข้าม จะกลายเป็น "ฮอส (King)" ซึ่งสามารถเดินและกินทแยงได้ทั้งข้างหน้าและข้างหลัง
5. **การสิ้นสุดเกม:** ชนะเมื่อกินหมากฝ่ายตรงข้ามจนหมดกระดาน, ฝ่ายตรงข้ามไม่มีตาเดินเหลือ, ฝ่ายตรงข้ามยอมแพ้ หรือฝ่ายตรงข้ามหมดเวลาในตาเดิน

---

## 🚀 สถาปัตยกรรมและเทคโนโลยี (Tech Stack)

* **Frontend:** Vanilla JavaScript (ES Modules), HTML5, CSS3 Grid & Animations
* **State & Rules Engine:** Pure functional checkers rules with clone immutability
* **Bot AI Engine:** Minimax Algorithm, Alpha-Beta Pruning, Web Worker
* **Networking:** Secure MQTT WebSocket (`wss://broker.emqx.io:8084/mqtt`) + HTML5 `BroadcastChannel`
* **Audio:** Web Audio API Procedural Synthesizer
* **Hosting:** GitHub Pages (100% Client-side Static)

---

## 💻 การติดตั้งและรันในเครื่อง (Local Development)

```bash
# Clone repository
git clone https://github.com/multiratt/minimal-checkers.git
cd minimal-checkers

# รันด้วย Python HTTP Server
python3 -m http.server 8080

# หรือรันด้วย Node.js
npx serve .
```
จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:8080` เพื่อเข้าเล่นได้ทันที!
