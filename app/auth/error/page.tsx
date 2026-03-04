import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">出错了</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {params?.error ? (
                <p className="text-sm text-muted-foreground">
                  错误信息：{params.error}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  发生了未知错误，请稍后重试。
                </p>
              )}
              <Link
                href="/auth/login"
                className="text-sm underline underline-offset-4"
              >
                返回登录
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
