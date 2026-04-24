"use client";

import { useState } from "react";
import { Settings, CreditCard, Link2, Mail, User, Shield, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "49€",
    credits: "500 crédits/mois",
    features: ["500 crédits", "1 workspace", "LinkedIn scraping", "Enrichissement Hunter", "Email AI"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "149€",
    credits: "2,000 crédits/mois",
    popular: true,
    features: ["2,000 crédits", "3 workspaces", "Toutes les sources", "CRM integrations", "Priority support"],
  },
  {
    id: "scale",
    name: "Scale",
    price: "499€",
    credits: "10,000 crédits/mois",
    features: ["10,000 crédits", "Workspaces illimités", "API access", "SSO / SAML", "Dedicated support"],
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("billing");
  const [saving, setSaving] = useState(false);

  async function handleSaveProfile() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="size-5 text-muted-foreground" />
          Paramètres
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez votre compte, votre abonnement et vos intégrations.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-fit">
          <TabsTrigger value="billing">
            <CreditCard className="size-4 mr-1.5" />
            Abonnement
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Link2 className="size-4 mr-1.5" />
            Intégrations
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="size-4 mr-1.5" />
            Profil
          </TabsTrigger>
        </TabsList>

        {/* Billing */}
        <TabsContent value="billing" className="mt-4 space-y-4">
          <Card className="card-leadaly border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Plan actuel</CardTitle>
              <CardDescription>Vous êtes sur le plan Starter.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="text-sm">Starter</Badge>
                <span className="text-sm text-muted-foreground">Renouvelle le 24 mai 2026</span>
              </div>
              <Button variant="outline" size="sm">Gérer l&apos;abonnement</Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`card-leadaly border-0 shadow-sm ${plan.popular ? "ring-2 ring-indigo-500" : ""}`}
              >
                <CardContent className="p-4">
                  {plan.popular && (
                    <Badge className="mb-2 text-[10px] bg-indigo-500">Le plus populaire</Badge>
                  )}
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-2xl font-bold mt-1">{plan.price}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.credits}</p>
                  <Separator className="my-3" />
                  <ul className="space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="text-emerald-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-4 text-xs h-8 ${
                      plan.popular
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    {plan.id === "starter" ? "Plan actuel" : `Choisir ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="card-leadaly border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="size-4" />
                Crédits restants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold">342</span>
                <span className="text-muted-foreground mb-1">/ 500 crédits utilisés ce mois</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-3">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: "68%" }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                158 crédits restants. Renouvellement le 24 mai.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-4 space-y-4">
          {[
            { name: "Apify", desc: "LinkedIn Sales Navigator scraping", connected: false, icon: "🔗" },
            { name: "LinkdAPI", desc: "Alternative scraping API", connected: false, icon: "🔗" },
            { name: "Hunter.io", desc: "Recherche et vérification d&apos;emails", connected: false, icon: "🎯" },
            { name: "HubSpot", desc: "CRM integration", connected: false, icon: "🟠" },
            { name: "Stripe", desc: "Billing et paiements", connected: false, icon: "💳" },
          ].map((integration) => (
            <Card key={integration.name} className="card-leadaly border-0 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{integration.name}</p>
                    <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: integration.desc }} />
                  </div>
                </div>
                <Badge variant={integration.connected ? "default" : "outline"} className="text-xs">
                  {integration.connected ? "Connecté" : "Non connecté"}
                </Badge>
              </CardContent>
            </Card>
          ))}
          <p className="text-xs text-muted-foreground text-center">
            Les clés API seront configurées côté serveur. Aucune donnée sensitive exposée côté client.
          </p>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card className="card-leadaly border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" placeholder="Prénom" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" placeholder="Nom" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@exemple.com" />
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
                >
                  {saving ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : null}
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-leadaly border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="size-4" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm">Changer le mot de passe</Button>
              <p className="text-xs text-muted-foreground">
                L&apos;authentification est gérée par Clerk. Vous pouvez la gérer depuis le portail Clerk.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
