import { useState, useEffect, useRef } from "react";
import { useSiteConfig, useUpdateSiteConfig } from "@/hooks/useSiteConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const COMMON_EMOJIS = ["🏠", "⭐", "🚀", "💡", "🎯", "📚", "🌟", "💼", "🎨", "🔥", "✨", "🌈"];

export default function SiteConfigPage() {
  const { data: config, isLoading } = useSiteConfig();
  const updateConfig = useUpdateSiteConfig();
  const [siteName, setSiteName] = useState("");
  const [logoType, setLogoType] = useState<"none" | "emoji" | "image">("none");
  const [logoEmoji, setLogoEmoji] = useState("");
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (config) {
      setSiteName(config.site_name);
      setLogoType(config.logo_type || "none");
      setLogoEmoji(config.logo_emoji || "");
      setLogoImageUrl(config.logo_image_url || null);
    }
  }, [config]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 2 Mo.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("site-assets")
        .getPublicUrl(fileName);

      setLogoImageUrl(publicUrl.publicUrl);
      
      toast({
        title: "Image téléchargée",
        description: "L'image a été téléchargée avec succès.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setLogoImageUrl(null);
  };

  const handleSave = async () => {
    if (!config) return;

    await updateConfig.mutateAsync({
      id: config.id,
      site_name: siteName,
      logo_type: logoType,
      logo_emoji: logoType === "emoji" ? logoEmoji : null,
      logo_image_url: logoType === "image" ? logoImageUrl : null,
    });

    toast({
      title: "Enregistré",
      description: "La configuration du site a été mise à jour.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuration du site</h1>
        <p className="text-muted-foreground">
          Personnalisez les paramètres généraux de votre site.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>
            Ces informations apparaîtront sur votre site public.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nom du site</Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Mon Site"
            />
          </div>

          <div className="space-y-4">
            <Label>Logo du site</Label>
            <RadioGroup
              value={logoType}
              onValueChange={(value) => setLogoType(value as "none" | "emoji" | "image")}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="logo-none" />
                <Label htmlFor="logo-none" className="font-normal cursor-pointer">
                  Aucun logo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="emoji" id="logo-emoji" />
                <Label htmlFor="logo-emoji" className="font-normal cursor-pointer">
                  Emoji
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="logo-image" />
                <Label htmlFor="logo-image" className="font-normal cursor-pointer">
                  Image
                </Label>
              </div>
            </RadioGroup>

            {logoType === "emoji" && (
              <div className="space-y-3 pl-6">
                <div className="flex flex-wrap gap-2">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setLogoEmoji(emoji)}
                      className={`text-2xl p-2 rounded-md hover:bg-accent transition-colors ${
                        logoEmoji === emoji ? "bg-accent ring-2 ring-primary" : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="customEmoji" className="shrink-0">
                    Ou saisissez un emoji :
                  </Label>
                  <Input
                    id="customEmoji"
                    value={logoEmoji}
                    onChange={(e) => setLogoEmoji(e.target.value)}
                    className="w-20 text-center text-xl"
                    maxLength={2}
                  />
                </div>
              </div>
            )}

            {logoType === "image" && (
              <div className="space-y-3 pl-6">
                {logoImageUrl ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={logoImageUrl}
                      alt="Logo du site"
                      className="h-12 w-12 object-contain rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Télécharger une image
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Format recommandé : PNG ou SVG, max 2 Mo
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="pt-4 border-t">
            <Label className="text-muted-foreground text-sm">Aperçu :</Label>
            <div className="flex items-center gap-2 mt-2 p-3 bg-muted rounded-md">
              {logoType === "emoji" && logoEmoji && (
                <span className="text-2xl">{logoEmoji}</span>
              )}
              {logoType === "image" && logoImageUrl && (
                <img
                  src={logoImageUrl}
                  alt="Logo"
                  className="h-8 w-8 object-contain"
                />
              )}
              <span className="text-xl font-semibold">{siteName || "Mon Site"}</span>
            </div>
          </div>

          <Button onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enregistrer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
