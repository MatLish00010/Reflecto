import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center py-8 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI Дневник
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Записывайте свои мысли и получайте AI-анализ
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Новая запись</CardTitle>
              <CardDescription>
                Опишите свой день, мысли или события
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Заголовок
                </label>
                <Input
                  id="title"
                  placeholder="Краткое описание дня..."
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-2">
                  Содержание
                </label>
                <Textarea
                  id="content"
                  placeholder="Расскажите о своем дне, мыслях, чувствах..."
                  className="min-h-[200px]"
                />
              </div>
              <Button className="w-full">
                Сохранить и проанализировать
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Анализ</CardTitle>
              <CardDescription>
                Искусственный интеллект проанализирует ваши записи
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Создайте первую запись, чтобы получить AI-анализ</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>История записей</CardTitle>
            <CardDescription>
              Ваши предыдущие записи и анализы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Здесь будут отображаться ваши записи</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
