import packageJson from '@/package.json';

export function AppVersionFooter({ className }: { className?: string }) {
  return (
    <p className={className ?? 'text-center text-sm text-muted-foreground'}>
      FichAqui v{packageJson.version}
    </p>
  );
}
