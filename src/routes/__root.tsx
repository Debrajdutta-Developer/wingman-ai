export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },

      { title: "NayePankh AI — Talent Discovery & Internship OS" },

      {
        name: "description",
        content:
          "Pankh.ai is an enterprise-grade Talent Discovery Operating System that analyzes resumes, matches candidates to internships, identifies skill gaps, prepares interviews, and creates personalized learning roadmaps.",
      },

      {
        property: "og:title",
        content: "NayePankh AI — Talent Discovery & Internship OS",
      },

      {
        property: "og:description",
        content:
          "Pankh.ai is an enterprise-grade Talent Discovery Operating System that optimizes recruitment pipelines, analyzes candidates, and accelerates career growth through AI-powered talent discovery.",
      },

      {
        property: "og:type",
        content: "website",
      },

      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/26d7f059-c7ce-4a6d-8969-bfb8a3d8e618",
      },

      {
        name: "twitter:card",
        content: "summary_large_image",
      },

      {
        name: "twitter:title",
        content: "NayePankh AI — Talent Discovery & Internship OS",
      },

      {
        name: "twitter:description",
        content:
          "AI-powered talent discovery, internship matching, resume analysis, interview preparation, and skill-gap mapping.",
      },

      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/26d7f059-c7ce-4a6d-8969-bfb8a3d8e618",
      },
      { property: "og:title", content: "NayePankh AI — Talent Discovery & Internship OS" },
      { name: "twitter:title", content: "NayePankh AI — Talent Discovery & Internship OS" },
      { name: "description", content: "Wingman AI helps students discover internships, analyze skills, and create personalized career roadmaps." },
      { property: "og:description", content: "Wingman AI helps students discover internships, analyze skills, and create personalized career roadmaps." },
      { name: "twitter:description", content: "Wingman AI helps students discover internships, analyze skills, and create personalized career roadmaps." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fc244b2e-3047-4579-ad29-ab774861ed3c/id-preview-26bdc4ec--59abf7b8-fafa-4079-9967-5b5f1302047b.lovable.app-1781524305025.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fc244b2e-3047-4579-ad29-ab774861ed3c/id-preview-26bdc4ec--59abf7b8-fafa-4079-9967-5b5f1302047b.lovable.app-1781524305025.png" },
    ],

    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
