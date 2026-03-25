import { Button } from '@/components/ui/button-shad';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        document.documentElement.classList.remove('dark');
    }, []);

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className=" relative flex min-h-screen flex-col items-center p-6 text-[#1b1b18] lg:justify-center lg:p-8">
                <div className="absolute inset-0 bg-[url('/images/welcomeBG.jpg')] bg-cover bg-center blur-[0.5px] filter dark:bg-[#0a0a0a]"></div>

                <div className=" relative z-10 flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="   flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
                        <div className="flex  flex-1 flex-col items-start justify-center rounded-br-lg rounded-bl-lg bg-white p-6 pb-12 text-left text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-tl-lg lg:rounded-br-none lg:p-20 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                            <h1 className="mb-2 text-left text-2xl font-semibold text-gray-900 dark:text-gray-100">Welcome Admin,</h1>
                            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                                Manage bookings, client communications, and scheduling seamlessly through this Events Management System.
                            </p>

                            <ul className="mt-8 flex justify-start gap-3 text-sm leading-normal">
                                <li>
                                    {auth.user ? (
                                        <Button variant="brand">
                                            <Link href={route('dashboard')}>Dashboard</Link>
                                        </Button>
                                    ) : (
                                        <Button variant="brand">
                                            <Link href={route('login')}>Log in</Link>
                                        </Button>
                                    )}
                                </li>
                            </ul>
                        </div>

                        <div className="relative -mb-px aspect-[335/376] w-full shrink-0 overflow-hidden rounded-t-lg bg-[url('/images/flowerbg5.jpg')] bg-cover bg-center lg:mb-0 lg:-ml-px lg:aspect-auto lg:w-[438px] lg:rounded-t-none lg:rounded-r-lg dark:bg-[#1D0002]"></div>
                    </main>
                </div>

                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
