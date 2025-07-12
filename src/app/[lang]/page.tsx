import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { NewEntryForm } from "@/components/new-entry-form";
import { getDictionary } from "@/dictionaries";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: "en" | "ru" }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center py-8 relative">
          <div className="absolute top-0 right-0 flex gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {dict.app.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {dict.app.description}
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{dict.newEntry.title}</CardTitle>
              <CardDescription>{dict.newEntry.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <NewEntryForm
                contentLabel={dict.newEntry.contentLabel}
                contentPlaceholder={dict.newEntry.contentPlaceholder}
                saveButton={dict.newEntry.saveButton}
                voiceRecording={dict.newEntry.voiceRecording}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{dict.aiAnalysis.title}</CardTitle>
              <CardDescription>{dict.aiAnalysis.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>{dict.aiAnalysis.emptyState}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{dict.history.title}</CardTitle>
            <CardDescription>{dict.history.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>{dict.history.emptyState}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
