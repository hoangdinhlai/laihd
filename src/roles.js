// The names the office gives its people. Each Claude Code session takes the first role still free, so the first
// session in is the CEO, the next the COO, and so on; when every role is taken the office falls back to the
// session's own name (its project folder).
//
// A role is only what the person is called on screen. The project folder each session works in is still shown
// beside the name in the session list, so nothing is lost by naming people this way.
//
// To rename the staff, edit this list: order decides who gets which role, so put the ones you want to see first
// at the top. Keep each one short — a name tag over someone's head is cut after 11 characters.
export const ROLES = [
  // Lãnh đạo
  'CEO',    // Chief Executive Officer · Tổng giám đốc
  'COO',    // Chief Operating Officer · Giám đốc vận hành
  'CFO',    // Chief Financial Officer · Giám đốc tài chính
  'CTO',    // Chief Technology Officer · Giám đốc công nghệ
  'CIO',    // Chief Information Officer · Giám đốc công nghệ thông tin
  'CMO',    // Chief Marketing Officer · Giám đốc tiếp thị
  'CHRO',   // Chief Human Resources Officer · Giám đốc nhân sự

  // Phòng ban
  'HR',     // Human Resources · Nhân sự
  'ADM',    // Administration · Hành chính
  'GA',     // General Affairs · Tổng vụ
  'FIN',    // Finance · Tài chính
  'ACC',    // Accounting · Kế toán
  'OPS',    // Operations · Vận hành
  'O&S',    // Operations & Support · Vận hành và hỗ trợ
  'IT',     // Information Technology · Công nghệ thông tin
  'MKT',    // Marketing · Tiếp thị
  'S&M',    // Sales & Marketing · Kinh doanh và tiếp thị
  'BD',     // Business Development · Phát triển kinh doanh
  'PR',     // Public Relations · Quan hệ công chúng
  'CS',     // Customer Service · Chăm sóc khách hàng
  'PUR',    // Purchasing · Mua hàng
  'SCM',    // Supply Chain Management · Quản lý chuỗi cung ứng
  'LOG',    // Logistics · Giao nhận, vận chuyển
  'WH',     // Warehouse · Kho hàng
  'R&D',    // Research & Development · Nghiên cứu và phát triển
  'QA',     // Quality Assurance · Đảm bảo chất lượng
  'QC',     // Quality Control · Kiểm soát chất lượng
  'L&D',    // Learning & Development · Đào tạo và phát triển
  'HSE',    // Health, Safety & Environment · Sức khoẻ, an toàn và môi trường
  'FM',     // Facilities Management · Quản lý cơ sở vật chất
  'HK',     // Housekeeping · Vệ sinh, chăm sóc không gian
  'F&B',    // Food & Beverage · Đồ ăn và thức uống

  // Hỗ trợ
  'PA',     // Personal Assistant · Trợ lý cá nhân
  'EA',     // Executive Assistant · Trợ lý điều hành
  'PM',     // Project Manager · Quản lý dự án
  'PMO',    // Project Management Office · Văn phòng quản lý dự án
];

export default ROLES;
