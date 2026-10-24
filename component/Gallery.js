import File from "./File";


export default function Home() {
  return (
    <main className="bg-[#d4ff3f]">
        <section className="mx-auto flex max-w-3xl flex-col gap-6 px-6 pb-8 pt-24 text-center font-sans">
        <h2 className="text-4xl font-semibold leading-tight dark:text-black tracking-tight text-foreground md:text-4xl">
          Good things grow when we {" "}
          <span className="text-[#6b3fa0]">share them.</span>
        </h2>

        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg dark:text-gray-900">
         Come for the experience. Stay for the friendships. Bring someone along and watch the joy multiply.
 Because the best part of coming alive is helping others come alive too.
        </p>
        <span className="text-xl font-bold">Share yours with <span className="font-bold text-[#6b3fa0]">#PurpleSunday {" "}</span>
          and<span className="font-bold text-[#6b3fa0]"> #LivePurple.</span></span>
      </section>
      <File
        cardWidth={320}
        cardGap={24}
        perspective={2200}
        scrollSpeed={1}
        scrollLerp={0.1}
        maxRotation={80}
      />

      
    </main>
  );
}