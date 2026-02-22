import User2 from "@/components/User2";
import { prisma } from "../../../prisma/prisma";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function Page({ searchParams }: PageProps) {
  const param = await searchParams;

  if (!param || !param.userId) {
    return (
      <div className="flex h-screen items-center justify-center bg-black font-mono">
        <div className="border border-red-500/50 bg-red-500/10 p-4 text-red-500">
          <span className="animate-pulse">[! ]</span> ERROR: INVALID_TARGET_PARAMETERS
        </div>
      </div>
    );
  }

  const pa = param.userId;
  const userId = Array.isArray(pa) ? pa[0] : pa || '';

  const andereUser = await prisma.user.findFirst({
    where: { id: userId }
  });

  if (!andereUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-black font-mono">
        <div className="border border-yellow-500/50 bg-yellow-500/10 p-4 text-yellow-500">
          <span className="animate-pulse">[? ]</span> WARNING: ENTITY_NOT_FOUND_IN_DATABASE
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] p-8 pt-24">
      {/* HUD Overlay Decoratie */}
      <div className="pointer-events-none fixed inset-0 flex flex-col justify-between p-4 opacity-20">
        <div className="flex justify-between font-mono text-[10px] text-cyan-500">
          <span>SCAN_MODE: ACTIVE</span>
          <span>COORDS: 51.0500° N, 3.3333° E</span>
        </div>
        <div className="flex justify-between font-mono text-[10px] text-cyan-500">
          <span>REF_ID: {userId.slice(0, 8)}...</span>
          <span>SYSTEM_STABLE: 100%</span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4 border-l-4 border-cyan-500 pl-4">
          <div>
            <h2 className="font-mono text-sm uppercase tracking-tighter text-cyan-400">
              Subject_Analysis
            </h2>
            <p className="text-xs text-white/40 font-mono">Retreiving biometric and registry data...</p>
          </div>
        </div>

        <section className="relative flex justify-center py-12">
            {/* Scanline animatie effect over de card */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden max-w-sm mx-auto rounded-lg">
                <div className="h-[2px] w-full bg-cyan-500/20 shadow-[0_0_15px_cyan] animate-[scan_3s_ease-in-out_infinite]" />
            </div>
            
            <User2 user={andereUser} />
        </section>
      </div>
    </main>
  );
}

export default Page;