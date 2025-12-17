import { useEffect, useState } from 'react';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import type { Produkte, Preise, Geschaefte } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Store,
  Package,
  Euro,
  PlusCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, isValid } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface DashboardData {
  produkte: Produkte[];
  preise: Preise[];
  geschaefte: Geschaefte[];
}

interface ProductPriceHistory {
  produktname: string;
  history: { datum: string; preis: number; geschaeft: string }[];
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  trend: 'up' | 'down' | 'stable';
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state for adding new price
  const [formData, setFormData] = useState({
    produkt: '',
    geschaeft: '',
    preis: '',
    datum: format(new Date(), 'yyyy-MM-dd'),
    bemerkungen: '',
  });

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [produkte, preise, geschaefte] = await Promise.all([
        LivingAppsService.getProdukte(),
        LivingAppsService.getPreise(),
        LivingAppsService.getGeschaefte(),
      ]);

      setData({ produkte, preise, geschaefte });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Daten');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.produkt || !formData.geschaeft || !formData.preis || !formData.datum) {
      toast.error('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    try {
      // Create applookup URLs
      const produktUrl = createRecordUrl(APP_IDS.PRODUKTE, formData.produkt);
      const geschaeftUrl = createRecordUrl(APP_IDS.GESCHAEFTE, formData.geschaeft);

      await LivingAppsService.createPreiseEntry({
        produkt: produktUrl,
        geschaeft: geschaeftUrl,
        preis: parseFloat(formData.preis),
        datum: formData.datum, // date/date format: YYYY-MM-DD
        bemerkungen: formData.bemerkungen || undefined,
      });

      toast.success('Preis wurde erfolgreich hinzugefügt');

      // Reset form and close dialog
      setFormData({
        produkt: '',
        geschaeft: '',
        preis: '',
        datum: format(new Date(), 'yyyy-MM-dd'),
        bemerkungen: '',
      });
      setDialogOpen(false);

      // Reload data
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Fehler beim Speichern');
    }
  };

  // Calculate KPIs
  const calculateKPIs = () => {
    if (!data) return null;

    const totalProducts = data.produkte.length;
    const totalShops = data.geschaefte.length;
    const totalPriceObservations = data.preise.length;

    // Calculate average price
    const prices = data.preise
      .map(p => p.fields.preis)
      .filter((p): p is number => p !== null && p !== undefined);
    const avgPrice = prices.length > 0
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length
      : 0;

    // Find latest price observations
    const sortedPreise = [...data.preise].sort((a, b) => {
      const dateA = a.fields.datum ? new Date(a.fields.datum).getTime() : 0;
      const dateB = b.fields.datum ? new Date(b.fields.datum).getTime() : 0;
      return dateB - dateA;
    });

    const recentObservations = sortedPreise.slice(0, 5);

    // Calculate price trends by product
    const productPriceHistories: Record<string, ProductPriceHistory> = {};

    data.preise.forEach((preis) => {
      const produktId = extractRecordId(preis.fields.produkt);
      const geschaeftId = extractRecordId(preis.fields.geschaeft);

      if (!produktId || preis.fields.preis === null || preis.fields.preis === undefined) return;

      const produkt = data.produkte.find(p => p.record_id === produktId);
      const geschaeft = data.geschaefte.find(g => g.record_id === geschaeftId);

      if (!produkt) return;

      const produktname = produkt.fields.produktname || 'Unbekannt';

      if (!productPriceHistories[produktId]) {
        productPriceHistories[produktId] = {
          produktname,
          history: [],
          currentPrice: 0,
          lowestPrice: Infinity,
          highestPrice: -Infinity,
          trend: 'stable',
        };
      }

      const entry = productPriceHistories[produktId];
      entry.history.push({
        datum: preis.fields.datum || '',
        preis: preis.fields.preis,
        geschaeft: geschaeft?.fields.geschaeftsname || 'Unbekannt',
      });

      // Update min/max
      if (preis.fields.preis < entry.lowestPrice) {
        entry.lowestPrice = preis.fields.preis;
      }
      if (preis.fields.preis > entry.highestPrice) {
        entry.highestPrice = preis.fields.preis;
      }
    });

    // Calculate trends
    Object.values(productPriceHistories).forEach((entry) => {
      // Sort by date
      entry.history.sort((a, b) => {
        const dateA = a.datum ? new Date(a.datum).getTime() : 0;
        const dateB = b.datum ? new Date(b.datum).getTime() : 0;
        return dateA - dateB;
      });

      if (entry.history.length > 0) {
        entry.currentPrice = entry.history[entry.history.length - 1].preis;

        if (entry.history.length >= 2) {
          const prevPrice = entry.history[entry.history.length - 2].preis;
          const currentPrice = entry.currentPrice;

          if (currentPrice > prevPrice) {
            entry.trend = 'up';
          } else if (currentPrice < prevPrice) {
            entry.trend = 'down';
          } else {
            entry.trend = 'stable';
          }
        }
      }
    });

    return {
      totalProducts,
      totalShops,
      totalPriceObservations,
      avgPrice,
      recentObservations,
      productPriceHistories: Object.values(productPriceHistories),
    };
  };

  // Prepare chart data for price comparison by shop
  const prepareShopComparisonData = () => {
    if (!data) return [];

    const shopPrices: Record<string, { name: string; totalPrice: number; count: number }> = {};

    data.preise.forEach((preis) => {
      const geschaeftId = extractRecordId(preis.fields.geschaeft);
      if (!geschaeftId || preis.fields.preis === null || preis.fields.preis === undefined) return;

      const geschaeft = data.geschaefte.find(g => g.record_id === geschaeftId);
      if (!geschaeft) return;

      const name = geschaeft.fields.geschaeftsname || 'Unbekannt';

      if (!shopPrices[geschaeftId]) {
        shopPrices[geschaeftId] = { name, totalPrice: 0, count: 0 };
      }

      shopPrices[geschaeftId].totalPrice += preis.fields.preis;
      shopPrices[geschaeftId].count += 1;
    });

    return Object.values(shopPrices)
      .map((shop) => ({
        name: shop.name,
        avgPrice: shop.count > 0 ? shop.totalPrice / shop.count : 0,
        observations: shop.count,
      }))
      .sort((a, b) => a.avgPrice - b.avgPrice);
  };

  // Prepare line chart data for top 3 products
  const prepareTopProductsChartData = () => {
    if (!data) return [];

    const kpis = calculateKPIs();
    if (!kpis) return [];

    // Get top 3 products with most observations
    const topProducts = kpis.productPriceHistories
      .sort((a, b) => b.history.length - a.history.length)
      .slice(0, 3);

    // Collect all unique dates
    const allDates = new Set<string>();
    topProducts.forEach((product) => {
      product.history.forEach((h) => {
        if (h.datum) allDates.add(h.datum);
      });
    });

    // Sort dates
    const sortedDates = Array.from(allDates).sort();

    // Build chart data
    return sortedDates.map((datum) => {
      const dataPoint: any = { datum: format(parseISO(datum), 'dd.MM', { locale: de }) };

      topProducts.forEach((product) => {
        const priceOnDate = product.history.find((h) => h.datum === datum);
        dataPoint[product.produktname] = priceOnDate ? priceOnDate.preis : null;
      });

      return dataPoint;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Fehler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={loadData} className="w-full">
              Erneut versuchen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpis = calculateKPIs();
  const shopComparisonData = prepareShopComparisonData();
  const topProductsChartData = prepareTopProductsChartData();

  if (!kpis) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Preisvergleich Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Überwache und vergleiche Preise verschiedener Produkte
            </p>
          </div>

          {/* Add Price Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <PlusCircle className="h-5 w-5" />
                Preis hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Neuen Preis hinzufügen</DialogTitle>
                <DialogDescription>
                  Erfasse einen neuen Preispunkt für ein Produkt in einem Geschäft
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="produkt">Produkt *</Label>
                  <Select
                    value={formData.produkt}
                    onValueChange={(value) => setFormData({ ...formData, produkt: value })}
                  >
                    <SelectTrigger id="produkt">
                      <SelectValue placeholder="Produkt auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {data?.produkte.map((p) => (
                        <SelectItem key={p.record_id} value={p.record_id}>
                          {p.fields.produktname || 'Unbekannt'}
                          {p.fields.marke && ` - ${p.fields.marke}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geschaeft">Geschäft *</Label>
                  <Select
                    value={formData.geschaeft}
                    onValueChange={(value) => setFormData({ ...formData, geschaeft: value })}
                  >
                    <SelectTrigger id="geschaeft">
                      <SelectValue placeholder="Geschäft auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {data?.geschaefte.map((g) => (
                        <SelectItem key={g.record_id} value={g.record_id}>
                          {g.fields.geschaeftsname || 'Unbekannt'}
                          {g.fields.stadt && ` - ${g.fields.stadt}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preis">Preis (€) *</Label>
                  <Input
                    id="preis"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preis}
                    onChange={(e) => setFormData({ ...formData, preis: e.target.value })}
                    placeholder="9.99"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="datum">Beobachtungsdatum *</Label>
                  <Input
                    id="datum"
                    type="date"
                    value={formData.datum}
                    onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bemerkungen">Bemerkungen</Label>
                  <Textarea
                    id="bemerkungen"
                    value={formData.bemerkungen}
                    onChange={(e) => setFormData({ ...formData, bemerkungen: e.target.value })}
                    placeholder="Optional: Zusätzliche Informationen..."
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button type="submit">Speichern</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Produkte
              </CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalProducts}</div>
              <p className="text-xs text-gray-500 mt-1">Verschiedene Produkte</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Geschäfte
              </CardTitle>
              <Store className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalShops}</div>
              <p className="text-xs text-gray-500 mt-1">Überwachte Geschäfte</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Preisbeobachtungen
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalPriceObservations}</div>
              <p className="text-xs text-gray-500 mt-1">Erfasste Datenpunkte</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Durchschnittspreis
              </CardTitle>
              <Euro className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.avgPrice.toFixed(2)} €</div>
              <p className="text-xs text-gray-500 mt-1">Über alle Produkte</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Trends Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Preisentwicklung Top 3 Produkte</CardTitle>
              <CardDescription>
                Preisverlauf der meist beobachteten Produkte
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topProductsChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={topProductsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="datum"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}€`}
                    />
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(2)} €`}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    {kpis.productPriceHistories
                      .sort((a, b) => b.history.length - a.history.length)
                      .slice(0, 3)
                      .map((product, index) => (
                        <Line
                          key={product.produktname}
                          type="monotone"
                          dataKey={product.produktname}
                          stroke={['#3b82f6', '#10b981', '#f59e0b'][index]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          connectNulls
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  Keine Daten verfügbar
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shop Comparison Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Geschäfte-Vergleich</CardTitle>
              <CardDescription>
                Durchschnittspreise nach Geschäft (sortiert)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {shopComparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={shopComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}€`}
                    />
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(2)} €`}
                      labelStyle={{ color: '#000' }}
                    />
                    <Bar dataKey="avgPrice" fill="#3b82f6" name="Ø Preis" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  Keine Daten verfügbar
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Price Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Produkt-Preis-Übersicht</CardTitle>
            <CardDescription>
              Aktuelle Preise und Trends aller Produkte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kpis.productPriceHistories.length > 0 ? (
              <div className="space-y-4">
                {kpis.productPriceHistories
                  .sort((a, b) => a.produktname.localeCompare(b.produktname))
                  .map((product) => (
                    <div
                      key={product.produktname}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.produktname}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.history.length} Beobachtung{product.history.length !== 1 ? 'en' : ''}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 md:mt-0">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Aktuell</p>
                          <p className="text-lg font-bold text-blue-600">
                            {product.currentPrice.toFixed(2)} €
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-xs text-gray-500">Niedrigster</p>
                          <p className="text-lg font-semibold text-green-600">
                            {product.lowestPrice.toFixed(2)} €
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-xs text-gray-500">Höchster</p>
                          <p className="text-lg font-semibold text-red-600">
                            {product.highestPrice.toFixed(2)} €
                          </p>
                        </div>

                        <div>
                          {product.trend === 'up' && (
                            <Badge variant="destructive" className="gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Steigend
                            </Badge>
                          )}
                          {product.trend === 'down' && (
                            <Badge variant="default" className="gap-1 bg-green-600">
                              <TrendingDown className="h-3 w-3" />
                              Fallend
                            </Badge>
                          )}
                          {product.trend === 'stable' && (
                            <Badge variant="secondary" className="gap-1">
                              Stabil
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Noch keine Preisdaten vorhanden</p>
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  Ersten Preis hinzufügen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Observations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Neueste Preisbeobachtungen
            </CardTitle>
            <CardDescription>
              Die letzten 5 erfassten Preise
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kpis.recentObservations.length > 0 ? (
              <div className="space-y-3">
                {kpis.recentObservations.map((preis) => {
                  const produktId = extractRecordId(preis.fields.produkt);
                  const geschaeftId = extractRecordId(preis.fields.geschaeft);

                  const produkt = data?.produkte.find(p => p.record_id === produktId);
                  const geschaeft = data?.geschaefte.find(g => g.record_id === geschaeftId);

                  const datum = preis.fields.datum
                    ? format(parseISO(preis.fields.datum), 'PPP', { locale: de })
                    : 'Unbekannt';

                  return (
                    <div
                      key={preis.record_id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {produkt?.fields.produktname || 'Unbekannt'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {geschaeft?.fields.geschaeftsname || 'Unbekannt'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{datum}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">
                          {preis.fields.preis?.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Keine Beobachtungen vorhanden
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
