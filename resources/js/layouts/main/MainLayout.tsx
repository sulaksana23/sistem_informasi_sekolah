import { useEffect } from 'react';
import { LAYOUT_DESKTOP_BREAKPOINT, useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/providers/settings-provider';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types/common/page-props';
import { showToast } from '@/components/common/alert';

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const isMobile = useIsMobile(LAYOUT_DESKTOP_BREAKPOINT);
    const { settings, setOption } = useSettings();
    const { flash } = usePage<PageProps>().props;

    useEffect(() => {
        if (flash?.success) {
            showToast("success", flash.success);
        }

        if (flash?.error) {
            showToast("destructive", flash.error);
        }
    }, [flash]);


    useEffect(() => {
        const bodyClass = document.body.classList;

        if (settings.layouts.demo1.sidebarCollapse) {
            bodyClass.add('sidebar-collapse');
        } else {
            bodyClass.remove('sidebar-collapse');
        }
    }, [settings]);

    useEffect(() => {
        setOption('layout', 'demo1');
    }, [setOption]);

    useEffect(() => {
        const bodyClass = document.body.classList;

        bodyClass.add('demo1');
        bodyClass.add('sidebar-fixed');
        bodyClass.add('header-fixed');
        bodyClass.add('bg-background');

        const timer = setTimeout(() => {
            bodyClass.add('layout-initialized');
        }, 1000);

        return () => {
            bodyClass.remove('demo1');
            bodyClass.remove('sidebar-fixed');
            bodyClass.remove('sidebar-collapse');
            bodyClass.remove('header-fixed');
            bodyClass.remove('layout-initialized');
            clearTimeout(timer);
        };
    }, []);

    return (
        <>
            {!isMobile && <Sidebar />}

            <div className="wrapper flex grow flex-col">
                <Header />

                <main className="grow pt-5" role="content">
                    {children}
                </main>

                <Footer />
            </div>
        </>
    );
}
