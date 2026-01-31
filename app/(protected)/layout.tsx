import { Appsidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <Appsidebar />
      <main>
        <div>
          {/* searchbar */}
          <div>{/* userbutton */}</div>
          <div>
            <div>{children}</div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;
