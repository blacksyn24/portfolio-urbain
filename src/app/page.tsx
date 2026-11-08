import { ChatWidget } from "@/components/ChatWidget";
import { DynamicIsland } from "@/components/DynamicIsland";
import { Footer } from "@/components/Footer";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Tracker } from "@/components/Tracker";
import { getSiteData } from "@/lib/data";

export const revalidate = 300;

export default async function HomePage() {
  const data = await getSiteData();
  const s = data.settings;
  const currentCert = data.certifications.find((c) => c.status === "en-cours");
  return (
    <>
      <DynamicIsland photo={s.photo_url} cvUrl={s.cv_url} name={s.first_name.split(" ")[0]} />
      <main>
        <Hero settings={s} badge={currentCert ? { title: currentCert.name, year: currentCert.year } : undefined} />
        <About settings={s} />
        <Skills skills={data.skills} />
        <Projects projects={data.projects} />
        <Journey timeline={data.timeline} certifications={data.certifications} />
        <Contact settings={s} />
      </main>
      <Footer settings={s} />
      {s.chatbot_enabled && <ChatWidget photo={s.photo_url} firstName={s.first_name.split(" ")[0]} />}
      <Tracker path="/" />
    </>
  );
}
