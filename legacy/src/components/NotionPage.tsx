interface NotionPageProps {
  url: string;
  title?: string;
}

export function NotionPage({ url, title }: NotionPageProps) {
  if (!url) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        <p>Aucune page Notion configurée pour cet élément.</p>
      </div>
    );
  }

  // Notion header height is approximately 45px - we shift the iframe up to hide it
  const notionHeaderHeight = 45;

  return (
    <div 
      className="w-full overflow-hidden"
      style={{ height: `calc(100vh - 4rem)` }}
    >
      <iframe
        src={url}
        title={title || "Contenu Notion"}
        className="w-full border-0"
        style={{
          marginTop: `-${notionHeaderHeight}px`,
          height: `calc(100vh - 4rem + ${notionHeaderHeight}px)`,
        }}
        allowFullScreen
      />
    </div>
  );
}
