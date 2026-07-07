# ClaimFlow — ระบบจัดการเอกสารเคลมประกันดิจิทัลสำหรับโรงพยาบาล

ระบบต้นแบบ (prototype) หน้าจอระบบจัดการเอกสารเคลมประกันดิจิทัล ครอบคลุมตั้งแต่แผนกต้อนรับไปจนถึงการส่งมอบเอกสารให้บริษัทประกัน ออกแบบตาม Figma: [claimflow](https://www.figma.com/design/jnmMd2Edfhi89rN3bzgxO8/claimflow) และสเปกฟีเจอร์ 5 ขั้นตอนของ HCFI

ระบบนี้เป็น **front-end prototype แบบ static** ทำงานภายในเบราว์เซอร์ทั้งหมด (mock data + mock integrations) เพื่อสาธิต UX/Workflow โดยสามารถเข้าใช้งานหน้าจอระบบส่วนต่าง ๆ ได้ตามลิงก์ด้านล่างนี้

---

## 🔗 ลิงก์ระบบผ่าน GitHub Pages (Production)
คุณสามารถทดลองใช้งานเวอร์ชันที่ Deploy แล้วบน GitHub Pages ได้ทันที:

*   🌐 **ทางเข้าพอร์ทัลหลัก (Portal Selection):** [https://nidss.github.io/HCFI/](https://nidss.github.io/HCFI/)
*   🏥 **พอร์ทัลพนักงานโรงพยาบาล (Hospital Staff Portal):** [https://nidss.github.io/HCFI/#/overview](https://nidss.github.io/HCFI/#/overview)
*   📱 **พอร์ทัลเซ็นเอกสารคนไข้ผ่าน iPad (Patient Signing Portal):** [https://nidss.github.io/HCFI/#/patient/select](https://nidss.github.io/HCFI/#/patient/select)
*   🏢 **พอร์ทัลบริษัทประกัน (Insurer Portal):** [https://nidss.github.io/HCFI/#/insurer/login](https://nidss.github.io/HCFI/#/insurer/login)

---

## 💻 ลิงก์ระบบสำหรับ Local Development (เมื่อรันบนเครื่องตนเอง)
เมื่อรันคำสั่ง `npm run dev` คุณสามารถเข้าใช้งานผ่านลิงก์ต่อไปนี้:

*   🌐 **ทางเข้าพอร์ทัลหลัก:** [http://localhost:5173/](http://localhost:5173/)
*   🏥 **พอร์ทัลพนักงานโรงพยาบาล:** [http://localhost:5173/#/overview](http://localhost:5173/#/overview)
*   📱 **พอร์ทัลเซ็นเอกสารคนไข้ผ่าน iPad:** [http://localhost:5173/#/patient/select](http://localhost:5173/#/patient/select)
*   🏢 **พอร์ทัลบริษัทประกัน:** [http://localhost:5173/#/insurer/login](http://localhost:5173/#/insurer/login)

> 🔑 **บัญชีสำหรับล็อกอินพอร์ทัลบริษัทประกัน:**
> *   **Username:** `insurer_demo`
> *   **Password:** `insurer2026`
>   *(ข้อมูลรหัสผ่านมีแสดงระบุไว้ในหน้าล็อกอินเพื่อความสะดวกในการทดสอบ)*

---

## 🌟 ฟีเจอร์หลักในระบบ

1.  **แผนกต้อนรับ (Reception)** — ค้นหาผู้ป่วยจากระบบ SIS ด้วยเลขบัตรประชาชน, สแกนบัตรประชาชนเข้าระบบ และส่งคำขอเซ็นใบยินยอมไปยังหน้าจอ iPad ของผู้ป่วย
2.  **ช่องชำระเงิน (Cashier)** — จับไฟล์ Invoice จาก Share Drive, จำลองการประมวลผลด้วย OCR เพื่อจับคู่ HN อัตโนมัติ (หรือคลิกจับคู่ด้วยตนเอง) และส่งเอกสารให้ผู้ป่วยเซ็นรับรองบนหน้าจอ iPad
3.  **จัดการเอกสาร (Documents)** — Dashboard ติดตามความครบถ้วนของเอกสาร ทั้งในมุมมองตารางและ Kanban (แยกตามกลุ่มสถานะ) พร้อมแสดงเหตุผลกรณีที่เอกสารถูกตีกลับ (รายละเอียดผู้ป่วยไม่ชัดเจน) และสามารถอัปโหลดไฟล์แก้ไขหรือดึงข้อมูลผ่านระบบ HIS เพิ่มเติมได้
4.  **ใบสรุปจ่าย (Accounting)** — รวบรวมผู้ป่วยที่พร้อมเบิกเป็นชุดเอกสาร ส่งเรื่องไปยัง ERP (จำลอง NetSuite) เพื่อขอเลขใบสรุปจ่ายและอัปเดตกลับเข้าระบบ
5.  **ส่งมอบเอกสาร (Delivery)** — สร้าง Token Link จำกัดอายุการใช้งาน พร้อมพอร์ทัลให้บริษัทประกัน Log-in (KYC) และเข้าตรวจสอบข้อมูลเพื่ออนุมัติหรือส่งคำขอตีกลับเอกสารเคลม
6.  **Audit Log** — บันทึกประวัติการทำรายการทุกขั้นตอนอย่างละเอียด ระบุ IP Address, ผู้ใช้งาน และผลลัพธ์
7.  **การตั้งค่า (Settings)** — การตรวจสอบสถานะการเชื่อมต่อ API (HIS/SIS, ERP/NetSuite, Storage) และนโยบายความปลอดภัยของระบบ

---

## 🛠️ เทคโนโลยีที่ใช้

*   **Core:** React 18 (TypeScript)
*   **Routing:** React Router DOM (ใช้งาน HashRouter เพื่อรองรับการ Deploy บน GitHub Pages แบบ Static Server)
*   **Styling:** Tailwind CSS + Lucide Icons
*   **Build Tool:** Vite

---

## 🚀 เริ่มต้นใช้งานและพัฒนา (Development Setup)

1.  **ติดตั้ง Dependencies:**
    ```bash
    npm install
    ```
2.  **รันระบบในโหมด Dev:**
    ```bash
    npm run dev
    ```
    *ระบบจะทำงานบนพอร์ตเริ่มต้นที่ `http://localhost:5173`*

3.  **การ Build สำหรับ Deploy:**
    ```bash
    npm run build
    npm run preview
    ```

---

## 📦 การ Deploy ขึ้น GitHub Pages

โปรเจกต์นี้ตั้งค่า GitHub Actions Workflow ไว้ที่ `.github/workflows/deploy.yml` ซึ่งจะทำการ Build และ Deploy ให้อัตโนมัติเมื่อมีการ Push โค้ดเข้าสู่ Branch `main`

**วิธีตั้งค่าในครั้งแรก:**
1.  ไปที่ Repository Settings ใน GitHub **Settings → Pages**
2.  เลือก Source เป็น **GitHub Actions**
3.  ทำการ Push โค้ดเข้าสู่ Branch `main` ระบบจะทำการ Deploy ให้อัตโนมัติ

---

## 💡 หมายเหตุสำคัญสำหรับการสาธิต

*   **Mock Data:** ข้อมูลผู้ป่วยและสถานะต่าง ๆ ถูกจัดเตรียมในรูปของ Mock Data (`src/lib/mockData.ts`) และเก็บไว้ใน React Context Memory (ข้อมูลจะรีเซ็ตกลับเป็นค่าเริ่มต้นเมื่อกดรีเฟรชหน้าเว็บ)
*   **การจำลอง OCR:** ระบบจะจับคู่ HN อัตโนมัติหากชื่อไฟล์ที่อัปโหลดตรงกับ HN ของผู้ป่วยในฐานข้อมูล เช่น `invoice_6604302.pdf`
*   **ลายเซ็นดิจิทัล:** ใช้ HTML Canvas จำลองลายเซ็นผ่านพอร์ทัลผู้ป่วยบน iPad โดยตรง เป็นการบันทึกข้อมูลภาพลายเซ็นแนบกับเอกสารเคลม (เป็นไปตาม พ.ร.บ. ธุรกรรมทางอิเล็กทรอนิกส์ มาตรา 9)
