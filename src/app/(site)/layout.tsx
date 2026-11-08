import { ChatWidget } from "@/components/ChatWidget";
import { DynamicIsland } from "@/components/DynamicIsland";
import { Footer } from "@/components/Footer";
import { Tracker } from "@/components/Tracker";
import { getSettings } from "@/lib/data";

export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const first = s.first_name.split(" ")[0];
  return (
    <>
      <DynamicIsland photo={s.photo_url} cvUrl={s.cv_url} name={first} />
      <main className="min-h-[70dvh]">{children}</main>
      <Footer settings={s} />
      {s.chatbot_enabled && <ChatWidget photo={s.photo_url} firstName={first} />}
      <Tracker />
    </>
  );
}
