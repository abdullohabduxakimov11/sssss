import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface POData {
  poNumber: string;
  quoteRef: string;
  date: string;
  client: {
    name: string;
    address: string;
  };
  requester: {
    company: string;
    contact: string;
    phone: string;
  };
  items: {
    description: string;
    qty: number;
    unitPrice: number;
    total: number;
  }[];
  summary: {
    subtotal: number;
    vat: number;
    shipping: number;
    total: number;
    currency: string;
  };
  notes: string;
}

export interface TicketReportItem {
  id: string;
  subject: string;
  clientName: string;
  clientEmail: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  description: string;
  engineerName?: string;
  engineerEmail?: string;
  engineerPhone?: string;
  quoteAmount?: string;
  quoteDescription?: string;
  updates?: any[];
}

export interface OpportunityReportItem {
  id: string;
  title: string;
  type: string;
  status: string;
  clientName: string;
  clientEmail?: string;
  budget: string;
  timeline: string;
  location: string;
  createdAt: string;
  description: string;
}

export interface ClientListItem {
  name: string;
  company: string;
  email: string;
  location: string;
  size: string;
  status: string;
  joined: string;
  phone: string;
  industry: string;
}

export interface EngineerListItem {
  name: string;
  email: string;
  location: string;
  status: string;
  joined: string;
  phone: string;
  rating?: number;
  skills?: string[];
  technicianType?: string;
  serviceType?: string;
  level?: string;
  experience?: string;
  languages?: string[];
  whatsapp?: string;
  bio?: string;
  hourlyRate?: string;
  halfDayRate?: string;
  fullDayRate?: string;
  specialization?: string;
  hasCV?: boolean;
  [key: string]: any;
}

export interface StaffListItem {
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  [key: string]: any;
}

export interface JobPostingReportItem {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  technicianType?: string;
  serviceType?: string;
  engineerLevel?: string;
  engineersCount?: number | string;
  salary?: string;
  language?: string;
  languageRequirement?: string;
  createdAt: string;
  imageUrl?: string;
  type?: string;
  status?: string;
  budget?: string;
  timeline?: string;
  [key: string]: any;
}

export const generatePOPDF = (data: POData) => {
  const doc = new jsPDF();
  const currency = data.summary.currency === 'EUR' ? '€' : '$';

  // Header
  doc.setFontSize(20);
  doc.setTextColor(45, 212, 191); // brand-teal
  doc.text("PURCHASE ORDER", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`PO Number: ${data.poNumber}`, 190, 30, { align: "right" });
  doc.text(`Date: ${data.date}`, 190, 35, { align: "right" });
  doc.text(`Quote Ref: ${data.quoteRef}`, 190, 40, { align: "right" });

  // Client Info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("VENDOR", 20, 50);
  doc.setFontSize(10);
  doc.text("D-Desknet Global IT Services", 20, 56);
  doc.text("Global Support Center", 20, 61);
  doc.text("Email: support@d-desknet.com", 20, 66);

  doc.setFontSize(12);
  doc.text("SHIP TO / BILL TO", 120, 50);
  doc.setFontSize(10);
  doc.text(data.client.name, 120, 56);
  doc.text(data.client.address, 120, 61, { maxWidth: 70 });

  // Table
  const tableData = data.items.map(item => [
    item.description,
    item.qty.toString(),
    `${currency}${item.unitPrice.toLocaleString()}`,
    `${currency}${item.total.toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: 80,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: tableData,
    headStyles: { fillColor: [45, 212, 191] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text("Notes:", 20, finalY);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(data.notes, 20, finalY + 5, { maxWidth: 100 });

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Subtotal:`, 140, finalY);
  doc.text(`${currency}${data.summary.subtotal.toLocaleString()}`, 190, finalY, { align: "right" });
  
  doc.text(`VAT (0%):`, 140, finalY + 5);
  doc.text(`${currency}${data.summary.vat.toLocaleString()}`, 190, finalY + 5, { align: "right" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL:`, 140, finalY + 15);
  doc.text(`${currency}${data.summary.total.toLocaleString()}`, 190, finalY + 15, { align: "right" });

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text("This is a computer generated document. No signature required.", 105, 285, { align: "center" });

  doc.save(`${data.poNumber}.pdf`);
};

export const generateTicketReportPDF = (tickets: TicketReportItem[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(45, 212, 191);
  doc.text("TICKET REPORT", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 190, 30, { align: "right" });

  tickets.forEach((ticket, index) => {
    if (index > 0) doc.addPage();
    
    const startY = index === 0 ? 40 : 20;
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Ticket: TK-${ticket.id.substring(0, 8).toUpperCase()}`, 20, startY);
    
    doc.setFontSize(10);
    doc.text(`Subject: ${ticket.subject}`, 20, startY + 10);
    doc.text(`Status: ${ticket.status}`, 20, startY + 15);
    doc.text(`Priority: ${ticket.priority}`, 20, startY + 20);
    doc.text(`Created: ${ticket.createdAt}`, 20, startY + 25);
    
    doc.text("Description:", 20, startY + 35);
    doc.setFontSize(9);
    doc.setTextColor(80);
    const splitDesc = doc.splitTextToSize(ticket.description, 170);
    doc.text(splitDesc, 20, startY + 40);
    
    const nextY = startY + 45 + (splitDesc.length * 5);
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Engineer Details:", 20, nextY);
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(`Name: ${ticket.engineerName || 'N/A'}`, 20, nextY + 5);
    doc.text(`Email: ${ticket.engineerEmail || 'N/A'}`, 20, nextY + 10);
    
    if (ticket.updates && ticket.updates.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text("Activity Timeline:", 20, nextY + 25);
      
      const updateData = ticket.updates.map(u => [
        u.timestamp?.seconds ? new Date(u.timestamp.seconds * 1000).toLocaleString() : (u.timestamp || 'N/A'),
        u.author || 'System',
        u.text
      ]);
      
      autoTable(doc, {
        startY: nextY + 30,
        head: [["Time", "Author", "Update"]],
        body: updateData,
        headStyles: { fillColor: [45, 212, 191] },
        styles: { fontSize: 8 }
      });
    }
  });

  doc.save(`Ticket-Report-${new Date().getTime()}.pdf`);
};

export const generateOpportunityReportPDF = (opps: OpportunityReportItem[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(45, 212, 191);
  doc.text("OPPORTUNITY REPORT", 105, 20, { align: "center" });

  const tableData = opps.map(opp => [
    opp.title,
    opp.type,
    opp.status,
    opp.budget,
    opp.location,
    opp.createdAt
  ]);

  autoTable(doc, {
    startY: 40,
    head: [["Title", "Type", "Status", "Budget", "Location", "Created"]],
    body: tableData,
    headStyles: { fillColor: [45, 212, 191] },
  });

  doc.save(`Opportunity-Report-${new Date().getTime()}.pdf`);
};

export const generateJobHistoryPDF = (jobs: any[]) => {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(45, 212, 191);
  doc.text("JOB HISTORY REPORT", 105, 20, { align: "center" });

  const tableData = jobs.map(job => [
    job.id.substring(0, 8).toUpperCase(),
    job.subject,
    job.clientName,
    job.status,
    job.completedDate || 'N/A'
  ]);

  autoTable(doc, {
    startY: 40,
    head: [["ID", "Subject", "Client", "Status", "Completed Date"]],
    body: tableData,
    headStyles: { fillColor: [45, 212, 191] },
  });

  doc.save(`Job-History-${new Date().getTime()}.pdf`);
};

export const generateClientListPDF = (clients: ClientListItem[]) => {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(45, 212, 191);
  doc.text("CLIENT LIST", 105, 20, { align: "center" });

  const tableData = clients.map(c => [
    c.name,
    c.company,
    c.email,
    c.location,
    c.status
  ]);

  autoTable(doc, {
    startY: 40,
    head: [["Name", "Company", "Email", "Location", "Status"]],
    body: tableData,
    headStyles: { fillColor: [45, 212, 191] },
  });

  doc.save(`Client-List-${new Date().getTime()}.pdf`);
};

export const generateEngineerListPDF = (engineers: EngineerListItem[]) => {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(45, 212, 191);
  doc.text("ENGINEER LIST", 105, 20, { align: "center" });

  const tableData = engineers.map(e => [
    e.name,
    e.email,
    e.location,
    e.technicianType || e.status,
    e.rating?.toString() || 'N/A'
  ]);

  autoTable(doc, {
    startY: 40,
    head: [["Name", "Email", "Location", "Type/Status", "Rating"]],
    body: tableData,
    headStyles: { fillColor: [45, 212, 191] },
  });

  doc.save(`Engineer-List-${new Date().getTime()}.pdf`);
};

export const generateStaffListPDF = (staff: StaffListItem[]) => {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(45, 212, 191);
  doc.text("STAFF LIST", 105, 20, { align: "center" });

  const tableData = staff.map(s => [
    s.name,
    s.email,
    s.role,
    s.status,
    s.joined
  ]);

  autoTable(doc, {
    startY: 40,
    head: [["Name", "Email", "Role", "Status", "Joined"]],
    body: tableData,
    headStyles: { fillColor: [45, 212, 191] },
  });

  doc.save(`Staff-List-${new Date().getTime()}.pdf`);
};

export const generateJobsReportPDF = (jobs: JobPostingReportItem[]) => {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(45, 212, 191);
  doc.text("JOB POSTINGS REPORT", 105, 20, { align: "center" });

  const tableData = jobs.map(j => [
    j.title,
    j.company,
    j.technicianType || j.type || 'N/A',
    j.location,
    j.salary || j.budget || 'N/A',
    j.createdAt
  ]);

  autoTable(doc, {
    startY: 40,
    head: [["Title", "Company", "Type", "Location", "Salary/Budget", "Created"]],
    body: tableData,
    headStyles: { fillColor: [45, 212, 191] },
  });

  doc.save(`Jobs-Report-${new Date().getTime()}.pdf`);
};

export const generatePolicyPDF = (title: string, content: string, filename: string) => {
  const doc = new jsPDF();
  
  // Add Title
  doc.setFontSize(22);
  doc.setTextColor(45, 212, 191); // brand-teal
  doc.text(title, 20, 30);
  
  // Add Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Last Updated: ${new Date().toLocaleDateString()}`, 20, 40);
  
  // Add Content
  doc.setFontSize(12);
  doc.setTextColor(0);
  const splitText = doc.splitTextToSize(content, 170);
  doc.text(splitText, 20, 55);
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
};

export const getPrivacyPolicyContent = () => `
Privacy Policy

Your privacy is important to us. It is our policy to respect your privacy regarding any information we may collect from you across our website.

1. Information we collect
We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.

2. Use of Information
We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.

3. Sharing of Information
We don’t share any personally identifying information publicly or with third-parties, except when required to by law.

4. Your Rights
You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.

Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.
`;

export const getTermsOfServiceContent = () => `
Terms of Service

1. Terms
By accessing the website, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.

2. Use License
Permission is granted to temporarily download one copy of the materials (information or software) on the website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.

3. Disclaimer
The materials on the website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

4. Limitations
In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the website.

5. Accuracy of materials
The materials appearing on the website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete or current.
`;

export const getCookiePolicyContent = () => `
Cookie Policy

This is the Cookie Policy, accessible from our website.

What Are Cookies
As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies.

How We Use Cookies
We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.

Disabling Cookies
You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit.

The Cookies We Set
- Account related cookies
- Login related cookies
- Email newsletters related cookies
- Forms related cookies
- Site preferences cookies
`;


