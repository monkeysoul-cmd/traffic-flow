declare module "*.css";
declare module "@/components/ui/dropdown-menu";
declare module "@/components/ui/popover";
declare module "@/components/ui/card";
declare module "@/components/ui/button";
declare module "@/components/ui/input";
declare module "@/components/ui/label";
declare module "@/components/ui/sidebar";
declare module "@/components/ui/badge";
declare module "@/components/ui/progress";
declare module "@/components/ui/scroll-area";
declare module "@/components/dashboard-layout";
declare module "@/components/dashboard/header";
declare module "@/components/dashboard/sidebar";
declare module "@/components/dashboard/history";
declare module "@/components/dashboard/overview";
declare module "@/components/analysis-form";
declare module "@/components/dashboard/profile-form";
declare module "pdf-parse" {
  const pdf: (dataBuffer: Buffer, options?: any) => Promise<{
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }>;
  export default pdf;
}
