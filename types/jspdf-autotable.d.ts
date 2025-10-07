// types/jspdf-autotable.d.ts

import { jsPDF } from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
    previousAutoTable?: {
      finalY: number;
    };
    autoTable: (options: UserOptions) => jsPDF;
  }
}

interface UserOptions {
  head?: any[][];
  body?: any[][];
  foot?: any[][];
  startY?: number;
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number; horizontal?: number; vertical?: number };
  pageBreak?: 'auto' | 'avoid' | 'always';
  rowPageBreak?: 'auto' | 'avoid';
  tableWidth?: 'auto' | 'wrap' | number;
  showHead?: 'everyPage' | 'firstPage' | 'never';
  showFoot?: 'everyPage' | 'lastPage' | 'never';
  tableLineColor?: number | number[];
  tableLineWidth?: number;
  theme?: 'striped' | 'grid' | 'plain';
  styles?: Partial<CellStyles>;
  headStyles?: Partial<CellStyles>;
  bodyStyles?: Partial<CellStyles>;
  footStyles?: Partial<CellStyles>;
  alternateRowStyles?: Partial<CellStyles>;
  columnStyles?: { [key: string]: Partial<CellStyles> };
  didDrawPage?: (data: CellHookData) => void;
  didDrawCell?: (data: CellHookData) => void;
  willDrawCell?: (data: CellHookData) => void;
  didParseCell?: (data: CellHookData) => void;
  willDrawPage?: (data: CellHookData) => void;
}

interface CellStyles {
  font?: string;
  fontStyle?: string;
  overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
  fillColor?: number | number[] | string | false;
  textColor?: number | number[] | string;
  cellWidth?: 'auto' | 'wrap' | number;
  minCellHeight?: number;
  minCellWidth?: number;
  halign?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  fontSize?: number;
  cellPadding?: number | { top?: number; right?: number; bottom?: number; left?: number; horizontal?: number; vertical?: number };
  lineColor?: number | number[] | string;
  lineWidth?: number;
}

interface CellHookData {
  cell: any;
  row: any;
  column: any;
  section: 'head' | 'body' | 'foot';
}

declare module 'jspdf-autotable' {
  export default function autoTable(doc: jsPDF, options: UserOptions): jsPDF;
}