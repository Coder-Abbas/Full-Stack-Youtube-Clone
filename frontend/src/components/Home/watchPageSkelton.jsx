import React from "react";
import Navbar from "../navbar/navbar";

const WatchPageSkeleton = () => {

    return (

        <div className="min-h-screen bg-[#f9f9f9]">
            <header className="fixed top-0 left-0 right-0 z-50 h-16">
                <Navbar />
            </header>

            <main className="pt-20">
                <div className="max-w-[1500px] mx-auto px-4 py-6">

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 animate-pulse">

                        <main className="min-w-0">

                            <div className="w-full aspect-video rounded-xl bg-gray-200" />

                            <div className="mt-4 h-7 w-4/5 bg-gray-200 rounded" />

                            <div className="flex flex-wrap items-center justify-between gap-4 py-4">

                                <div className="flex items-center gap-3 flex-1 min-w-0">

                                    <div className="w-11 h-11 rounded-full bg-gray-200 flex-shrink-0" />

                                    <div className="space-y-2 flex-1">

                                        <div className="h-4 w-40 bg-gray-200 rounded" />

                                        <div className="h-3.5 w-24 bg-gray-200 rounded" />

                                    </div>

                                    <div className="w-28 h-10 bg-gray-200 rounded-full" />

                                </div>

                                <div className="flex flex-wrap items-center gap-2">

                                    <div className="w-28 h-10 bg-gray-200 rounded-full" />

                                    <div className="w-24 h-10 bg-gray-200 rounded-full" />

                                    <div className="w-24 h-10 bg-gray-200 rounded-full" />

                                    <div className="w-10 h-10 bg-gray-200 rounded-full" />

                                </div>

                            </div>

                            <div className="bg-gray-100 rounded-xl p-4 space-y-3">

                                <div className="h-4 w-36 bg-gray-200 rounded" />

                                <div className="h-3.5 w-full bg-gray-200 rounded" />

                                <div className="h-3.5 w-11/12 bg-gray-200 rounded" />

                                <div className="h-3.5 w-10/12 bg-gray-200 rounded" />

                            </div>

                            <div className="mt-8 space-y-5">

                                <div className="h-6 w-40 bg-gray-200 rounded" />

                                <div className="flex gap-3">

                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />

                                    <div className="flex-1 space-y-3 pt-1">

                                        <div className="h-4 w-full bg-gray-200 rounded" />

                                        <div className="flex justify-end">

                                            <div className="w-28 h-10 bg-gray-200 rounded-full" />

                                        </div>

                                    </div>

                                </div>

                                <div className="space-y-4">

                                    <div className="flex gap-3">

                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />

                                        <div className="flex-1 space-y-2 pt-1">

                                            <div className="h-4 w-32 bg-gray-200 rounded" />

                                            <div className="h-4 w-full bg-gray-200 rounded" />

                                        </div>

                                    </div>

                                    <div className="flex gap-3">

                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />

                                        <div className="flex-1 space-y-2 pt-1">

                                            <div className="h-4 w-28 bg-gray-200 rounded" />

                                            <div className="h-4 w-11/12 bg-gray-200 rounded" />

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </main>

                        <aside className="hidden lg:block space-y-4">

                            <div className="h-6 w-36 bg-gray-200 rounded" />

                            <div className="space-y-3">

                                {Array.from({ length: 6 }).map((_, i) => (

                                    <div key={i} className="flex gap-3">

                                        <div className="w-40 h-24 rounded-xl bg-gray-200 flex-shrink-0" />

                                        <div className="flex-1 space-y-2 pt-1">

                                            <div className="h-4 w-full bg-gray-200 rounded" />

                                            <div className="h-3.5 w-2/3 bg-gray-200 rounded" />

                                            <div className="h-3.5 w-1/2 bg-gray-200 rounded" />

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </aside>

                    </div>

                </div>
            </main>
        </div>

    );
};

export default WatchPageSkeleton;