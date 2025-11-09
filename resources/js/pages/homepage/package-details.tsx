import Footer from '@/layouts/Footer';
import Navbar from '@/components/home/navbar';
import News from '@/components/home/news-ticker';
import WavesBackground from '@/components/home/waves-background';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface PackageType {
    package_id: string;
    package_name: string;
    package_description: string;
    services?: { services_id: number; service_name: string; description: string; image: string }[];
}

type PackageDetails = {
    package_id: string;
    package_name: string;
    package_description: string;
    package_price: number;
};


type promoType={
    package_id:string;
    package_name:string;
    package_promo: number;
}


export default function PackageDetails({ package: pkg, promo }: { package: PackageType, promo: promoType }) {
    const services = pkg?.services ?? [];
    const [showNews, setShowNews] = useState(true);
    const { packages } = usePage<{
        packages: PackageDetails[];
    }>().props;

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setShowNews(false);
            } else {
                setShowNews(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Head title={pkg.package_name} />
            {showNews && <News promo={promo?.package_promo} />}
            <section className="flex min-h-screen flex-col bg-white">
                <Navbar packages={packages} />

                {/* Header */}
                <div className="relative mx-auto mt-20 px-4 py-12 text-center">
                    <h1 className="heading-3 mb-3 font-heading">{pkg.package_name}</h1>
                    <p className="body-medium mx-auto max-w-2xl font-body text-gray-700">{pkg.package_description}</p>
                </div>
                <div className="mt-6 flex w-full flex-col items-center gap-4 p-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        {services.map((service) => {
                            return (
                                <div
                                    key={service.services_id}
                                    className={`relative w-[230px] cursor-pointer overflow-hidden rounded-2xl border shadow-md transition-all hover:shadow-xl`}
                                >
                                    <div className="flex h-[230px] w-full items-center justify-center overflow-hidden bg-gray-100">
                                        <img
                                            src={service.image ? `/storage/${service.image}` : '/default-image.png'}
                                            alt={service.service_name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col items-center justify-center bg-white p-4 text-center">
                                        <CardTitle>{service.service_name}</CardTitle>
                                        <CardDescription className="mt-1">
                                            {service.description || 'This subcategory contains a variety of options to suit your needs.'}
                                        </CardDescription>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Waves and Footer */}
                <div className="mt-20 w-full rotate-180">
                    <WavesBackground />
                </div>
                <div className="bg-[#FFECEC]">
                    <Footer />
                </div>
            </section>
        </>
    );
}
