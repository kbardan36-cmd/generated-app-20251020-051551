import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Bot, Github, Chrome } from 'lucide-react';
export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd validate credentials here
    login({ name: 'Demo User', email: 'demo@nexus.ai' });
    navigate('/');
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-secondary p-4">
      <Card className="mx-auto max-w-sm w-full shadow-soft">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Bot className="w-7 h-7 text-primary" />
            <CardTitle className="text-2xl font-display">NexusAI</CardTitle>
          </div>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required defaultValue="demo@nexus.ai" />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <Separator className="my-6">
            <span className="px-2 text-xs text-muted-foreground bg-card">OR CONTINUE WITH</span>
          </Separator>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleLogin}>
              <Github className="mr-2 h-4 w-4" /> GitHub
            </Button>
            <Button variant="outline" onClick={handleLogin}>
              <Chrome className="mr-2 h-4 w-4" /> Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}