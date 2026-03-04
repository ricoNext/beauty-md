import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">注册成功</CardTitle>
              <CardDescription>请查收你的确认邮件</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                你已成功注册。请检查你的邮箱，点击确认链接以激活账号。
                激活后即可
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4"
                >
                  登录
                </Link>
                使用。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
