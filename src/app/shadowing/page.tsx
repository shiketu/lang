import ShadowingStudio from "@/features/shadowing/components/ShadowingStudio";

export default function ShadowingPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">
        シャドーイング比較
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        お手本の動画から区間を切り出し、繰り返し練習。自分の録画と並べて発音を磨きます。
      </p>
      <ShadowingStudio />
    </div>
  );
}
