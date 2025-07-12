import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { getDictionary } from "@/dictionaries";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ru' }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

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
              <CardDescription>
                {dict.newEntry.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  {dict.newEntry.titleLabel}
                </label>
                <Input
                  id="title"
                  placeholder={dict.newEntry.titlePlaceholder}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-2">
                  {dict.newEntry.contentLabel}
                </label>
                <Textarea
                  id="content"
                  placeholder={dict.newEntry.contentPlaceholder}
                  className="min-h-[200px]"
                />
              </div>
              <Button className="w-full">
                {dict.newEntry.saveButton}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{dict.aiAnalysis.title}</CardTitle>
              <CardDescription>
                {dict.aiAnalysis.description}
              </CardDescription>
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
            <CardDescription>
              {dict.history.description}
            </CardDescription>
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