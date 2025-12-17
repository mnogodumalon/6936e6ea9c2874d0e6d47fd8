import { useEffect, useState } from 'react';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Preisvergleich, Geschaefte, Produkte } from '@/types/app';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Store,
  Package,
  LayoutGrid,
  Plus,
  TrendingUp,
  AlertCircle,
  ShoppingBag,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preisvergleich, setPreisvergleich] = useState<Preisvergleich[]>([]);
  const [geschaefte, setGeschaefte] = useState<Geschaefte[]>([]);
  const [produkte, setProdukte] = useState<Produkte[]>([]);

  // Dialog States
  const [geschaeftDialogOpen, setGeschaeftDialogOpen] = useState(false);
  const [produktDialogOpen, setProduktDialogOpen] = useState(false);

  // Form States
  const [neuesGeschaeft, setNeuesGeschaeft] = useState({
    geschaeftsname: '',
    kette: '',
    strasse: '',
    hausnummer: '',
    postleitzahl: '',
    stadt: '',
    notizen: ''
  });

  const [neuesProdukt, setNeuesProdukt] = useState({
    produktname: '',
    kategorie: '',
    marke: '',
    groesse: '',
    beschreibung: ''
  });

  // Produktkategorien aus app_metadata.json
  const produktKategorien = [
    'Lebensmittel',
    'Getraenke',
    'Haushalt',
    'Kosmetik',
    'Elektronik',
    'Sonstiges'
  ];

  // Load Data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [preisvergleichData, geschaefteData, produkteData] = await Promise.all([
        LivingAppsService.getPreisvergleich(),
        LivingAppsService.getGeschaefte(),
        LivingAppsService.getProdukte()
      ]);

      setPreisvergleich(preisvergleichData);
      setGeschaefte(geschaefteData);
      setProdukte(produkteData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Daten');
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  }

  // Create Geschaeft
  async function handleCreateGeschaeft() {
    try {
      if (!neuesGeschaeft.geschaeftsname || !neuesGeschaeft.stadt) {
        toast.error('Bitte füllen Sie mindestens Name und Stadt aus');
        return;
      }

      await LivingAppsService.createGeschaefteEntry(neuesGeschaeft);
      toast.success('Geschäft erfolgreich erstellt');
      setGeschaeftDialogOpen(false);
      setNeuesGeschaeft({
        geschaeftsname: '',
        kette: '',
        strasse: '',
        hausnummer: '',
        postleitzahl: '',
        stadt: '',
        notizen: ''
      });
      loadData();
    } catch (err) {
      toast.error('Fehler beim Erstellen des Geschäfts');
    }
  }

  // Create Produkt
  async function handleCreateProdukt() {
    try {
      if (!neuesProdukt.produktname) {
        toast.error('Bitte geben Sie einen Produktnamen ein');
        return;
      }

      await LivingAppsService.createProdukteEntry(neuesProdukt);
      toast.success('Produkt erfolgreich erstellt');
      setProduktDialogOpen(false);
      setNeuesProdukt({
        produktname: '',
        kategorie: '',
        marke: '',
        groesse: '',
        beschreibung: ''
      });
      loadData();
    } catch (err) {
      toast.error('Fehler beim Erstellen des Produkts');
    }
  }

  // Calculate Stats
  const stats = {
    totalProdukte: produkte.length,
    totalGeschaefte: geschaefte.length,
    totalPanels: preisvergleich.length,
    produkteByKategorie: produkte.reduce((acc, p) => {
      const kat = p.fields.kategorie || 'Ohne Kategorie';
      acc[kat] = (acc[kat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button onClick={loadData} variant="outline" size="sm" className="ml-4">
                Erneut versuchen
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Preisvergleich Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Übersicht über Produkte, Geschäfte und Preise
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produkte</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProdukte}</div>
              <p className="text-xs text-muted-foreground">
                Registrierte Produkte
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Geschäfte</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGeschaefte}</div>
              <p className="text-xs text-muted-foreground">
                Erfasste Geschäfte
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Panels</CardTitle>
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPanels}</div>
              <p className="text-xs text-muted-foreground">
                Konfigurierte Panels
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kategorien</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(stats.produkteByKategorie).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Produkt-Kategorien
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Produkte Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Produkte
                  </CardTitle>
                  <CardDescription>Verwaltung der Produkte</CardDescription>
                </div>
                <Dialog open={produktDialogOpen} onOpenChange={setProduktDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Neues Produkt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Neues Produkt erstellen</DialogTitle>
                      <DialogDescription>
                        Fügen Sie ein neues Produkt zum Preisvergleich hinzu
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="produktname">Produktname *</Label>
                        <Input
                          id="produktname"
                          value={neuesProdukt.produktname}
                          onChange={(e) => setNeuesProdukt({ ...neuesProdukt, produktname: e.target.value })}
                          placeholder="z.B. Milch 1L"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="kategorie">Kategorie</Label>
                        <Select
                          value={neuesProdukt.kategorie}
                          onValueChange={(value) => setNeuesProdukt({ ...neuesProdukt, kategorie: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kategorie wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {produktKategorien.map((kat) => (
                              <SelectItem key={kat} value={kat}>
                                {kat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="marke">Marke</Label>
                        <Input
                          id="marke"
                          value={neuesProdukt.marke}
                          onChange={(e) => setNeuesProdukt({ ...neuesProdukt, marke: e.target.value })}
                          placeholder="z.B. Müller"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="groesse">Größe/Einheit</Label>
                        <Input
                          id="groesse"
                          value={neuesProdukt.groesse}
                          onChange={(e) => setNeuesProdukt({ ...neuesProdukt, groesse: e.target.value })}
                          placeholder="z.B. 1L, 500g"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="beschreibung">Beschreibung</Label>
                        <Textarea
                          id="beschreibung"
                          value={neuesProdukt.beschreibung}
                          onChange={(e) => setNeuesProdukt({ ...neuesProdukt, beschreibung: e.target.value })}
                          placeholder="Zusätzliche Informationen..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setProduktDialogOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button onClick={handleCreateProdukt}>
                        Produkt erstellen
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {produkte.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Noch keine Produkte vorhanden</p>
                  <p className="text-sm mt-1">Erstellen Sie Ihr erstes Produkt</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {produkte.map((produkt) => (
                    <div
                      key={produkt.record_id}
                      className="flex items-start justify-between p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{produkt.fields.produktname}</div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          {produkt.fields.marke && (
                            <span>{produkt.fields.marke}</span>
                          )}
                          {produkt.fields.groesse && (
                            <span>• {produkt.fields.groesse}</span>
                          )}
                        </div>
                      </div>
                      {produkt.fields.kategorie && (
                        <Badge variant="secondary">
                          {produkt.fields.kategorie}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Geschäfte Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Geschäfte
                  </CardTitle>
                  <CardDescription>Verwaltung der Geschäfte</CardDescription>
                </div>
                <Dialog open={geschaeftDialogOpen} onOpenChange={setGeschaeftDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Neues Geschäft
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Neues Geschäft erstellen</DialogTitle>
                      <DialogDescription>
                        Fügen Sie ein neues Geschäft hinzu
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="geschaeftsname">Geschäftsname *</Label>
                        <Input
                          id="geschaeftsname"
                          value={neuesGeschaeft.geschaeftsname}
                          onChange={(e) => setNeuesGeschaeft({ ...neuesGeschaeft, geschaeftsname: e.target.value })}
                          placeholder="z.B. REWE"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="kette">Kette/Filiale</Label>
                        <Input
                          id="kette"
                          value={neuesGeschaeft.kette}
                          onChange={(e) => setNeuesGeschaeft({ ...neuesGeschaeft, kette: e.target.value })}
                          placeholder="z.B. Filiale Nord"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 grid gap-2">
                          <Label htmlFor="strasse">Straße</Label>
                          <Input
                            id="strasse"
                            value={neuesGeschaeft.strasse}
                            onChange={(e) => setNeuesGeschaeft({ ...neuesGeschaeft, strasse: e.target.value })}
                            placeholder="Hauptstraße"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="hausnummer">Nr.</Label>
                          <Input
                            id="hausnummer"
                            value={neuesGeschaeft.hausnummer}
                            onChange={(e) => setNeuesGeschaeft({ ...neuesGeschaeft, hausnummer: e.target.value })}
                            placeholder="123"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="grid gap-2">
                          <Label htmlFor="postleitzahl">PLZ</Label>
                          <Input
                            id="postleitzahl"
                            value={neuesGeschaeft.postleitzahl}
                            onChange={(e) => setNeuesGeschaeft({ ...neuesGeschaeft, postleitzahl: e.target.value })}
                            placeholder="12345"
                          />
                        </div>
                        <div className="col-span-2 grid gap-2">
                          <Label htmlFor="stadt">Stadt *</Label>
                          <Input
                            id="stadt"
                            value={neuesGeschaeft.stadt}
                            onChange={(e) => setNeuesGeschaeft({ ...neuesGeschaeft, stadt: e.target.value })}
                            placeholder="Berlin"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="notizen">Notizen</Label>
                        <Textarea
                          id="notizen"
                          value={neuesGeschaeft.notizen}
                          onChange={(e) => setNeuesGeschaeft({ ...neuesGeschaeft, notizen: e.target.value })}
                          placeholder="Zusätzliche Informationen..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setGeschaeftDialogOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button onClick={handleCreateGeschaeft}>
                        Geschäft erstellen
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {geschaefte.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Noch keine Geschäfte vorhanden</p>
                  <p className="text-sm mt-1">Erstellen Sie Ihr erstes Geschäft</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {geschaefte.map((geschaeft) => (
                    <div
                      key={geschaeft.record_id}
                      className="p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="font-medium mb-1">
                        {geschaeft.fields.geschaeftsname}
                        {geschaeft.fields.kette && (
                          <span className="text-sm text-slate-500 ml-2">
                            ({geschaeft.fields.kette})
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-500 space-y-0.5">
                        {(geschaeft.fields.strasse || geschaeft.fields.hausnummer) && (
                          <div>
                            {geschaeft.fields.strasse} {geschaeft.fields.hausnummer}
                          </div>
                        )}
                        {(geschaeft.fields.postleitzahl || geschaeft.fields.stadt) && (
                          <div>
                            {geschaeft.fields.postleitzahl} {geschaeft.fields.stadt}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kategorie-Übersicht */}
        {Object.keys(stats.produkteByKategorie).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Produkte nach Kategorie</CardTitle>
              <CardDescription>Verteilung der Produkte auf Kategorien</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(stats.produkteByKategorie).map(([kategorie, count]) => (
                  <div
                    key={kategorie}
                    className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-800"
                  >
                    <span className="font-medium">{kategorie}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
