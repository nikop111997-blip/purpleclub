import File from "./File";


export default function Home() {
  return (
    <main className="bg-[#d4ff3f]">
        <section className="mx-auto flex max-w-3xl flex-col gap-6 px-6 pb-8 pt-24 text-center font-sans">
        <h2 className="text-4xl font-semibold leading-tight dark:text-black tracking-tight text-foreground md:text-6xl">
          Good things grow when we {" "}
          <span className="text-[#6b3fa0]">share them.</span>
        </h2>

        <p className="mx-auto max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg dark:text-gray-900">
          People stay because they belong. They bring friends because they are
          proud of it. And they keep coming back because, somewhere along the
          way, it becomes part of who they are. Share yours with <span className="font-bold text-[#6b3fa0]">#PurpleSunday {" "}</span>
          and<span className="font-bold text-[#6b3fa0]"> #LivePurple.</span>
        </p>
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