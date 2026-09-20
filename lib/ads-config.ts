import { z } from "zod";
export const placements = [
  "top",
  "left",
  "right",
  "below-tool",
  "above-footer",
] as const;
export const adSchema = z
  .object({
    enabled: z.boolean(),
    autoAds: z.boolean(),
    publisher: z.string().regex(/^(ca-pub-\d{16})?$/),
    placements: z
      .array(
        z.object({
          id: z.enum(placements),
          mode: z.enum(["off", "reserved", "sponsor", "adsense"]),
          title: z.string().max(100),
          imageUrl: z
            .string()
            .max(2048)
            .refine(
              (s) => !s || /^https:\/\//.test(s),
              "Use an HTTPS image URL",
            )
            .default(""),
          description: z.string().max(160),
          url: z
            .string()
            .max(2048)
            .refine((s) => !s || /^https:\/\//.test(s), "Use an HTTPS URL"),
          slot: z.string().regex(/^\d{0,20}$/),
          device: z.enum(["all", "desktop", "mobile"]),
          categories: z.array(z.string()).max(5),
          excludedPaths: z
            .array(z.string().max(200).regex(/^\//))
            .max(100)
            .default([]),
        }),
      )
      .length(5),
  })
  .superRefine((v, c) => {
    if (new Set(v.placements.map((p) => p.id)).size !== 5)
      c.addIssue({
        code: "custom",
        message: "Each placement must appear exactly once.",
      });
    if (
      (v.autoAds || v.placements.some((p) => p.mode === "adsense")) &&
      !v.publisher
    )
      c.addIssue({
        code: "custom",
        message: "Add an AdSense publisher ID before enabling ads.",
      });
    for (const p of v.placements) {
      if (p.mode === "sponsor" && !p.url)
        c.addIssue({
          code: "custom",
          message: "Sponsored placements require a destination URL.",
        });
      if (p.mode === "adsense" && !p.slot)
        c.addIssue({
          code: "custom",
          message: "AdSense placements require a slot ID.",
        });
    }
  });
export type AdConfig = z.infer<typeof adSchema>;
export const defaultAds: AdConfig = {
  enabled: true,
  autoAds: false,
  publisher: "",
  placements: placements.map((id) => ({
    id,
    mode: "off",
    title: "",
    imageUrl: "",
    description: "",
    url: "",
    slot: "",
    device: id === "left" || id === "right" ? "desktop" : "all",
    categories: [],
    excludedPaths: [],
  })),
};
