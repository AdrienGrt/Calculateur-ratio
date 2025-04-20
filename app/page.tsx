
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Analytics } from "@vercel/analytics/react"
import { Button } from "@/components/ui/button"
import { ClipboardCopy, RefreshCw, Eye, EyeOff, Palette, ChevronDown, ChevronUp, PlusCircle, MinusCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { NotFound } from "@/components/NotFound"

export default function ContrastCalculator() {
  const [foreground, setForeground] = useState("#000000")
  const [background, setBackground] = useState("#FFFFFF")
  const [contrastRatio, setContrastRatio] = useState(21)
  const [wcagAA, setWcagAA] = useState(true)
  const [wcagAAA, setWcagAAA] = useState(true)
  const [wcagAALarge, setWcagAALarge] = useState(true)
  const [wcagAAALarge, setWcagAAALarge] = useState(true)
  const [showColorPickerFg, setShowColorPickerFg] = useState(false)
  const [showColorPickerBg, setShowColorPickerBg] = useState(false)
  const [history, setHistory] = useState([])
  const [visualMode, setVisualMode] = useState("normal")

  // Fonction pour convertir une couleur hex en RGB
  const hexToRgb = (hex) => {
    // Supprimer le # si présent
    hex = hex.replace(/^#/, "")

    // Vérifier si la valeur hex est valide
    if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)) {
      return { r: 0, g: 0, b: 0 }
    }

    // Convertir en RGB
    let r, g, b
    if (hex.length === 3) {
      r = Number.parseInt(hex[0] + hex[0], 16)
      g = Number.parseInt(hex[1] + hex[1], 16)
      b = Number.parseInt(hex[2] + hex[2], 16)
    } else {
      r = Number.parseInt(hex.substring(0, 2), 16)
      g = Number.parseInt(hex.substring(2, 4), 16)
      b = Number.parseInt(hex.substring(4, 6), 16)
    }

    return { r, g, b }
  }

  // Fonction pour calculer la luminance relative
  const calculateLuminance = (r, g, b) => {
    const a = [r, g, b].map((v) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
  }

  // Fonction pour calculer le ratio de contraste
  const calculateContrastRatio = (color1, color2) => {
    try {
      const rgb1 = hexToRgb(color1)
      const rgb2 = hexToRgb(color2)

      const luminance1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b)
      const luminance2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b)

      const lighter = Math.max(luminance1, luminance2)
      const darker = Math.min(luminance1, luminance2)

      return (lighter + 0.05) / (darker + 0.05)
    } catch (error) {
      console.error("Erreur lors du calcul du contraste:", error)
      return 1
    }
  }

  // Fonction pour formater une couleur hex
  const formatHexColor = (color) => {
    // Supprimer le # si présent
    let hex = color.replace(/^#/, "")
    
    // Vérifier si la valeur hex est valide
    if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)) {
      return color
    }
    
    // Ajouter le # et convertir en majuscules
    return `#${hex.toUpperCase()}`
  }

  // Fonction pour inverser les couleurs
  const swapColors = () => {
    const temp = foreground
    setForeground(background)
    setBackground(temp)
  }

  // Fonction pour copier la combinaison de couleurs
  const copyColorCombo = () => {
    const combo = `Texte: ${foreground}, Arrière-plan: ${background}, Ratio: ${contrastRatio.toFixed(2)}:1`
    navigator.clipboard.writeText(combo)
    alert("Combinaison de couleurs copiée dans le presse-papiers !")
  }

  // Fonction pour générer des couleurs aléatoires conformes aux normes
  const generateAccessibleColors = (level = "AA") => {
    const randomHex = () => {
      return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
    }
    
    let newFg, newBg, ratio
    
    do {
      newFg = randomHex()
      newBg = randomHex()
      ratio = calculateContrastRatio(newFg, newBg)
    } while ((level === "AA" && ratio < 4.5) || (level === "AAA" && ratio < 7))
    
    setForeground(newFg)
    setBackground(newBg)
  }

  // Fonction pour enregistrer la combinaison dans l'historique
  const saveToHistory = () => {
    const newCombo = {
      foreground,
      background,
      ratio: contrastRatio,
      timestamp: new Date().getTime()
    }
    
    setHistory(prev => {
      // Éviter les doublons
      if (!prev.some(item => item.foreground === foreground && item.background === background)) {
        return [...prev.slice(-9), newCombo] // Garder seulement les 10 derniers
      }
      return prev
    })
  }

  // Fonction pour déterminer la couleur du texte du badge
  const getBadgeVariant = (passed) => {
    return passed ? "default" : "destructive"
  }
  
  // Mettre à jour le ratio de contraste lorsque les couleurs changent
  useEffect(() => {
    try {
      const ratio = calculateContrastRatio(foreground, background)
      setContrastRatio(ratio)

      // Vérifier les normes WCAG
      setWcagAA(ratio >= 4.5)
      setWcagAAA(ratio >= 7)
      setWcagAALarge(ratio >= 3)
      setWcagAAALarge(ratio >= 4.5)
      
      // Formater les couleurs
      setForeground(formatHexColor(foreground))
      setBackground(formatHexColor(background))
    } catch (error) {
      console.error("Erreur lors du calcul du contraste:", error)
    }
  }, [foreground, background])

  // Visualisation du niveau d'accessibilité
  const getAccessibilityLevel = () => {
    if (wcagAAA && wcagAAALarge) return { level: "AAA", message: "Excellent" }
    if (wcagAA && wcagAALarge) return { level: "AA", message: "Bon" }
    if (wcagAALarge) return { level: "AA Large", message: "Acceptable pour grand texte" }
    return { level: "Non conforme", message: "Insuffisant" }
  }

  const accessibilityInfo = getAccessibilityLevel()
  
  // Simuler différents types de vision
  const applyVisionFilter = () => {
    switch(visualMode) {
      case "protanopia":
        return "grayscale(0.5) contrast(1.2)"
      case "deuteranopia":
        return "contrast(1.1) brightness(0.9)"
      case "tritanopia":
        return "contrast(1.05) brightness(0.95) grayscale(0.6)"
      case "achromatopsia":
        return "grayscale(1)"
      default:
        return "none"
    }
  }

  return (
    
    <div className="container mx-auto pb-16">
      <Analytics />
      <Card className="max-w-4xl mx-auto shadow-lg mb-12 mt-10">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800  ">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold">Calculateur de Contraste</CardTitle>
              <CardDescription className="text-lg mt-2">
                Vérifiez et optimisez vos couleurs pour une accessibilité maximale
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => generateAccessibleColors("AA")}>
                      <Palette className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Générer des couleurs accessibles (AA)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={swapColors}>
                      <RefreshCw className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Inverser les couleurs</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Sélecteurs de couleurs */}
              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="foreground" className="text-lg font-medium mb-2 block">Couleur du texte</Label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-16 h-16 rounded-lg shadow-inner border cursor-pointer" 
                      style={{ backgroundColor: foreground }}
                      onClick={() => setShowColorPickerFg(!showColorPickerFg)}
                    />
                    <div className="flex-1 space-y-2">
                      <Input
                        id="foreground"
                        type="text"
                        value={foreground}
                        onChange={(e) => setForeground(e.target.value)}
                        className="font-mono text-lg"
                      />
                      {showColorPickerFg && (
                        <div className="mt-2">
                          <Input
                            type="color"
                            value={foreground}
                            onChange={(e) => setForeground(e.target.value)}
                            className="w-full h-10"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <Label htmlFor="background" className="text-lg font-medium mb-2 block">Couleur d'arrière-plan</Label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-16 h-16 rounded-lg shadow-inner border cursor-pointer" 
                      style={{ backgroundColor: background }}
                      onClick={() => setShowColorPickerBg(!showColorPickerBg)}
                    />
                    <div className="flex-1 space-y-2">
                      <Input
                        id="background"
                        type="text"
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        className="font-mono text-lg"
                      />
                      {showColorPickerBg && (
                        <div className="mt-2">
                          <Input
                            type="color"
                            value={background}
                            onChange={(e) => setBackground(e.target.value)}
                            className="w-full h-10"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Résultat du contraste avec jauge visuelle */}
              <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl shadow-inner">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold">Ratio de contraste</h3>
                  <Badge 
                    className="text-lg px-3 py-1"
                    variant={contrastRatio >= 4.5 ? "default" : contrastRatio >= 3 ? "outline" : "destructive"}
                  >
                    {accessibilityInfo.level}
                  </Badge>
                </div>
                
                <div className="text-4xl font-bold mb-4 flex items-center">
                  {contrastRatio.toFixed(2)}:1
                  <span className="text-sm ml-2 text-slate-500">{accessibilityInfo.message}</span>
                </div>
                
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                    style={{ width: `${Math.min(100, (contrastRatio / 21) * 100)}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium flex justify-between">
                      <span>Texte normal (AA)</span>
                      <span>≥ 4.5:1</span>
                    </div>
                    <Badge 
                      variant={getBadgeVariant(wcagAA)} 
                      className="w-full justify-center py-1"
                    >
                      {wcagAA ? "Réussi" : "Échoué"}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium flex justify-between">
                      <span>Texte normal (AAA)</span>
                      <span>≥ 7:1</span>
                    </div>
                    <Badge 
                      variant={getBadgeVariant(wcagAAA)} 
                      className="w-full justify-center py-1"
                    >
                      {wcagAAA ? "Réussi" : "Échoué"}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium flex justify-between">
                      <span>Grand texte (AA)</span>
                      <span>≥ 3:1</span>
                    </div>
                    <Badge 
                      variant={getBadgeVariant(wcagAALarge)} 
                      className="w-full justify-center py-1"
                    >
                      {wcagAALarge ? "Réussi" : "Échoué"}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium flex justify-between">
                      <span>Grand texte (AAA)</span>
                      <span>≥ 4.5:1</span>
                    </div>
                    <Badge 
                      variant={getBadgeVariant(wcagAAALarge)} 
                      className="w-full justify-center py-1"
                    >
                      {wcagAAALarge ? "Réussi" : "Échoué"}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={copyColorCombo}
                  >
                    <ClipboardCopy className="h-3 w-3 mr-1" /> Copier
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Prévisualisation */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Prévisualisation</h3>
                  <select 
                    className="text-sm border rounded p-1"
                    value={visualMode}
                    onChange={(e) => setVisualMode(e.target.value)}
                  >
                    <option value="normal">Vision normale</option>
                    <option value="protanopia">Protanopie (rouge-vert)</option>
                    <option value="deuteranopia">Deutéranopie (rouge-vert)</option>
                    <option value="tritanopia">Tritanopie (bleu-jaune)</option>
                    <option value="achromatopsia">Achromatopsie (n&b)</option>
                  </select>
                </div>

                <Tabs defaultValue="normal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-2">
                    <TabsTrigger value="normal">Texte normal</TabsTrigger>
                    <TabsTrigger value="large">Grand texte</TabsTrigger>
                    <TabsTrigger value="ui">UI</TabsTrigger>
                  </TabsList>
                  
                  <div style={{ filter: applyVisionFilter() }}>
                    <TabsContent value="normal">
                      <div
                        className="p-6 rounded-lg shadow-md mt-2 min-h-[200px] flex flex-col justify-center transition-all"
                        style={{ backgroundColor: background, color: foreground }}
                      >
                        <p className="text-base mb-4">Ceci est un exemple de texte normal utilisé pour les paragraphes.</p>
                        <p className="text-sm">
                          Le texte doit être facilement lisible pour respecter les normes d'accessibilité. 
                          Cette combinaison de couleurs présente un ratio de contraste de {contrastRatio.toFixed(2)}:1.
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="large">
                      <div
                        className="p-6 rounded-lg shadow-md mt-2 min-h-[200px] flex flex-col justify-center transition-all"
                        style={{ backgroundColor: background, color: foreground }}
                      >
                        <h2 className="text-3xl font-bold mb-3">Titre principal</h2>
                        <p className="text-xl">
                          Les grands textes ont des exigences de contraste moins strictes
                          en raison de leur meilleure lisibilité naturelle.
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="ui">
                      <div
                        className="p-6 rounded-lg shadow-md mt-2 min-h-[200px] transition-all"
                        style={{ backgroundColor: background }}
                      >
                        <div className="mb-4 flex justify-between items-center">
                          <div className="text-xl font-bold" style={{ color: foreground }}>Interface utilisateur</div>
                          <div 
                            className="px-3 py-1 rounded-full text-sm"
                            style={{ backgroundColor: foreground, color: background }}
                          >
                            Bouton
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div 
                            className="p-3 rounded border"
                            style={{ borderColor: foreground, color: foreground }}
                          >
                            Élément d'interface 1
                          </div>
                          <div 
                            className="p-3 rounded" 
                            style={{ backgroundColor: `${foreground}30`, color: foreground }}
                          >
                            Élément d'interface 2
                          </div>
                          <div 
                            className="p-3 rounded"
                            style={{ backgroundColor: foreground, color: background }}
                          >
                            Élément d'interface 3
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Recommandations */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm">
                <h3 className="font-medium mb-2">Conseils d'accessibilité</h3>
                <ul className="space-y-1">
                  {!wcagAA && (
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      Augmentez le contraste pour atteindre au moins 4.5:1 pour le texte standard.
                    </li>
                  )}
                  {wcagAA && !wcagAAA && (
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      Pour une accessibilité optimale (AAA), visez un ratio de 7:1.
                    </li>
                  )}
                  {wcagAAA && (
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      Excellent contraste ! Cette combinaison est accessible pour tous les utilisateurs.
                    </li>
                  )}
                  <li className="flex items-start mt-3">
                    <span className="text-blue-500 mr-2">•</span>
                    Testez avec différents modes de daltonisme pour une accessibilité complète.
                  </li>
                </ul>
              </div>

              {/* Référence WCAG */}
              <div className="text-sm bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Normes WCAG 2.1</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>
                    <span className="font-medium">AA texte normal:</span> ≥ 4.5:1
                  </div>
                  <div>
                    <span className="font-medium">AAA texte normal:</span> ≥ 7:1
                  </div>
                  <div>
                    <span className="font-medium">AA grand texte:</span> ≥ 3:1
                  </div>
                  <div>
                    <span className="font-medium">AAA grand texte:</span> ≥ 4.5:1
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Grand texte = ≥ 18pt ou 14pt gras (≥ 24px ou 18.5px gras)
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nouvelles sections SEO */}
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Section d'information sur l'importance du contraste */}
        <section className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Pourquoi le contraste est-il essentiel pour l'accessibilité web ?</h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-4">Le contraste des couleurs est un élément fondamental de l'accessibilité web qui affecte directement la lisibilité du contenu. Un contraste adéquat permet à <strong>tous les utilisateurs</strong>, y compris ceux ayant des déficiences visuelles, de percevoir clairement l'information présentée sur un site web.</p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Les bénéfices d'un bon contraste de couleurs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-lg">Amélioration de l'accessibilité</h4>
                <p>Un contraste suffisant permet aux personnes malvoyantes, daltoniennes ou âgées de mieux distinguer le texte du fond. Près de 300 millions de personnes dans le monde sont atteintes de daltonisme, et plus d'un milliard vivent avec une forme de déficience visuelle.</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-lg">Lisibilité dans toutes les conditions</h4>
                <p>Un bon contraste garantit que votre contenu reste lisible dans diverses conditions d'éclairage, comme sous un soleil éclatant ou sur des écrans de faible qualité.</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-lg">Conformité légale</h4>
                <p>Dans de nombreux pays, les organismes publics et parfois les entreprises privées sont légalement tenus de rendre leurs sites web accessibles, conformément à des normes telles que l'ADA aux États-Unis ou la RGAA en France.</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-lg">Expérience utilisateur améliorée</h4>
                <p>Un meilleur contraste bénéficie à tous les utilisateurs, pas seulement à ceux ayant des besoins spécifiques. Il réduit la fatigue oculaire et améliore l'expérience de navigation générale.</p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Impact sur le référencement (SEO)</h3>
            
            <p>Une bonne accessibilité, incluant un contraste adéquat, peut avoir un impact positif sur votre SEO :</p>
            
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>Les moteurs de recherche comme Google valorisent de plus en plus l'accessibilité dans leurs algorithmes de classement.</li>
              <li>Un site accessible attire et retient davantage d'utilisateurs, ce qui améliore les métriques d'engagement (temps passé sur le site, taux de rebond).</li>
              <li>La conformité aux normes d'accessibilité réduit les risques juridiques et améliore la réputation de votre marque.</li>
            </ul>
            
            <p>Selon le <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">WebAIM Million Report</a>, plus de 86% des pages d'accueil des sites web populaires présentent des problèmes de contraste insuffisant, ce qui montre l'ampleur du problème et l'opportunité de se démarquer en prenant cette question au sérieux.</p>
          </div>
        </section>
        
        {/* FAQ - Section avec questions fréquentes */}
        <section className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100" id="faq">Foire aux questions sur le contraste et l'accessibilité</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-medium">
                Que signifient les niveaux AA et AAA des normes WCAG ?
              </AccordionTrigger>
              <AccordionContent className="text-slate-700 dark:text-slate-300">
                <p>Les <strong>WCAG</strong> (Web Content Accessibility Guidelines) définissent trois niveaux de conformité :</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Niveau A</strong> : Niveau minimal d'accessibilité (le contraste minimal n'est pas défini à ce niveau)</li>
                  <li><strong>Niveau AA</strong> : Bon niveau d'accessibilité, exigeant un ratio de contraste d'au moins 4.5:1 pour le texte normal et 3:1 pour le grand texte</li>
                  <li><strong>Niveau AAA</strong> : Niveau optimal d'accessibilité, exigeant un ratio de contraste d'au moins 7:1 pour le texte normal et 4.5:1 pour le grand texte</li>                </ul>
                <p className="mt-2">La plupart des organisations visent au minimum la conformité AA, considérée comme un bon équilibre entre accessibilité et flexibilité de design.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-medium">
                Comment le contraste affecte-t-il les personnes daltoniennes ?
              </AccordionTrigger>
              <AccordionContent className="text-slate-700 dark:text-slate-300">
                <p>Le daltonisme affecte environ 8% des hommes et 0,5% des femmes dans le monde. Les personnes daltoniennes peuvent avoir du mal à distinguer certaines couleurs, comme le rouge et le vert (protanopie/deutéranopie) ou le bleu et le jaune (tritanopie).</p>
                <p className="mt-2">Un bon contraste aide ces utilisateurs à percevoir les différences entre texte et arrière-plan, même s'ils ne voient pas les couleurs exactement comme prévues. Notre outil permet de tester comment votre choix de couleurs apparaît avec différents types de daltonisme.</p>
                <p className="mt-2">En plus du contraste, évitez de transmettre des informations uniquement par la couleur (utilisez des icônes, motifs ou étiquettes textuelles en complément).</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-medium">
                Est-ce que le contraste élevé est toujours meilleur ?
              </AccordionTrigger>
              <AccordionContent className="text-slate-700 dark:text-slate-300">
                <p>Si un contraste élevé améliore généralement la lisibilité, un contraste extrême (comme noir pur sur blanc pur) peut causer de la fatigue visuelle lors d'une lecture prolongée, particulièrement pour les personnes ayant certains troubles visuels comme l'astigmatisme ou l'hypersensibilité à la lumière.</p>
                <p className="mt-2">Pour les textes longs, envisagez d'utiliser un contraste légèrement réduit mais toujours conforme aux normes, comme un gris très foncé (#333333) sur blanc au lieu de noir pur, tout en maintenant un ratio d'au moins 7:1.</p>
                <p className="mt-2">L'essentiel est de respecter au minimum les seuils WCAG recommandés tout en considérant votre public cible et le contexte d'utilisation.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-medium">
                Le contraste est-il important pour les éléments non textuels ?
              </AccordionTrigger>
              <AccordionContent className="text-slate-700 dark:text-slate-300">
                <p>Absolument. Les WCAG 2.1 exigent également un contraste minimal de 3:1 pour :</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Les icônes et éléments graphiques qui transmettent des informations</li>
                  <li>Les bordures des composants d'interface utilisateur (comme les champs de formulaire)</li>
                  <li>Les éléments indiquant un état ou une action possible</li>
                </ul>
                <p className="mt-2">Pour les éléments purement décoratifs, les exigences de contraste sont moins strictes, mais un bon contraste améliore généralement l'expérience utilisateur globale.</p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-medium">
                Comment calculer le ratio de contraste manuellement ?
              </AccordionTrigger>
              <AccordionContent className="text-slate-700 dark:text-slate-300">
                <p>Le calcul du ratio de contraste selon les WCAG suit une formule spécifique :</p>
                <ol className="list-decimal pl-6 mt-2 space-y-1">
                  <li>Convertir les couleurs RGB en luminance relative (en tenant compte de la perception humaine des différentes couleurs)</li>
                  <li>Appliquer la formule : (L1 + 0.05) / (L2 + 0.05), où L1 est la luminance la plus élevée et L2 la plus faible</li>
                </ol>
                <p className="mt-2">Le résultat est un ratio entre 1:1 (aucun contraste) et 21:1 (contraste maximal de noir sur blanc).</p>
                <p className="mt-2">Cette formule est complexe, c'est pourquoi notre calculateur l'automatise pour vous et vous donne immédiatement les résultats conformes aux standards WCAG.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
        
        {/* Guide des bonnes pratiques */}
        <section className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Guide des bonnes pratiques de contraste</h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mt-4 mb-3">1. Stratégies pour un design accessible</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Priorisez le contraste pour la hiérarchie</h4>
                <p>Utilisez différents niveaux de contraste pour établir une hiérarchie visuelle claire. Les éléments les plus importants (titres, appels à l'action) devraient avoir le contraste le plus élevé.</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Testez dans différents contextes</h4>
                <p>Évaluez vos combinaisons de couleurs sous différentes conditions : écrans de qualité variable, lumière du jour, mode sombre, et avec les simulateurs de daltonisme.</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Évitez les couleurs vibrantes superposées</h4>
                <p>Des couleurs vives complémentaires (comme rouge sur vert) peuvent créer un effet de vibration visuelle même avec un bon ratio numérique. Préférez des combinaisons plus harmonieuses.</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Documentez vos choix</h4>
                <p>Créez un guide de style documentant vos paires de couleurs approuvées avec leurs ratios de contraste. Cela garantit la cohérence à travers votre site.</p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">2. Palettes de couleurs accessibles recommandées</h3>
            
            <p>Voici quelques combinaisons de couleurs qui respectent les normes d'accessibilité tout en restant esthétiques :</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              <div className="space-y-2">
                <div className="h-20 rounded-lg" style={{ backgroundColor: "#1A365D" }}></div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                  <p className="font-medium">Bleu foncé</p>
                  <p className="text-sm font-mono">#1A365D</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 rounded-lg" style={{ backgroundColor: "#F7FAFC" }}></div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                  <p className="font-medium">Blanc cassé</p>
                  <p className="text-sm font-mono">#F7FAFC</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 rounded-lg" style={{ backgroundColor: "#2D3748" }}></div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                  <p className="font-medium">Gris ardoise</p>
                  <p className="text-sm font-mono">#2D3748</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 rounded-lg" style={{ backgroundColor: "#EDF2F7" }}></div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                  <p className="font-medium">Gris clair</p>
                  <p className="text-sm font-mono">#EDF2F7</p>
                </div>
              </div>
            </div>
            
            <p className="mt-4">Ces combinaisons offrent un excellent point de départ, mais n'hésitez pas à utiliser notre calculateur pour créer votre propre palette accessible adaptée à votre identité visuelle.</p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">3. Contraste et mode sombre</h3>
            
            <p>Le mode sombre nécessite une attention particulière pour le contraste :</p>
            
            <ul className="list-disc pl-6 space-y-2 my-4">
              <li>Évitez le blanc pur (#FFFFFF) sur noir pur (#000000) car ce contraste extrême peut causer une fatigue visuelle</li>
              <li>Préférez des gris très clairs (comme #E2E8F0) sur des gris très foncés (comme #1A202C)</li>
              <li>Augmentez légèrement la saturation des couleurs d'accent en mode sombre pour maintenir leur visibilité</li>
              <li>Testez séparément les ratios de contraste pour votre mode clair et votre mode sombre</li>
            </ul>
            
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400 my-6">
              <p className="font-medium">Conseil professionnel</p>
              <p className="mt-1">N'oubliez pas que certains utilisateurs activent le mode sombre pour réduire la fatigue oculaire, alors que d'autres le font pour des raisons de préférence visuelle. Dans tous les cas, les exigences de contraste WCAG s'appliquent toujours.</p>
            </div>
          </div>
        </section>
        
        {/* Outils et ressources complémentaires */}
        <section className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Ressources complémentaires sur l'accessibilité</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Outils d'accessibilité recommandés</h3>
              
              <ul className="space-y-4">
                <li className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium">WAVE (Web Accessibility Evaluation Tool)</h4>
                  <p className="text-sm mt-1">Une extension de navigateur qui permet d'analyser l'accessibilité des pages web, y compris les problèmes de contraste.</p>
                </li>
                
                <li className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium">Axe DevTools</h4>
                  <p className="text-sm mt-1">Un outil d'audit d'accessibilité pour les développeurs, disponible comme extension Chrome et Firefox.</p>
                </li>
                
                <li className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium">Colour Contrast Analyser</h4>
                  <p className="text-sm mt-1">Une application de bureau qui permet de vérifier le contraste entre deux couleurs et simule différents types de déficiences visuelles.</p>
                </li>
                
                <li className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium">Stark</h4>
                  <p className="text-sm mt-1">Plugin pour Figma et Sketch qui aide les designers à créer des interfaces accessibles dès la phase de conception.</p>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Documentation et références</h3>
              
              <ul className="space-y-4">
                <li className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium">Web Content Accessibility Guidelines (WCAG)</h4>
                  <p className="text-sm mt-1">La référence officielle pour les normes d'accessibilité web, incluant les critères de contraste.</p>
                </li>
                
                <li className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium">A11Y Project</h4>
                  <p className="text-sm mt-1">Une communauté open source qui propose des ressources, des checklist et des bonnes pratiques pour l'accessibilité web.</p>
                </li>
                
                <li className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium">MDN Web Docs - Accessibilité</h4>
                  <p className="text-sm mt-1">Documentation complète de Mozilla sur l'accessibilité web, avec des guides pratiques sur le contraste et d'autres aspects.</p>
                </li>
                
                <li className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium">W3C - Introduction à l'accessibilité web</h4>
                  <p className="text-sm mt-1">Guide d'introduction par le World Wide Web Consortium qui explique les bases de l'accessibilité web.</p>
                </li>
              </ul>
            </div>
          </div>
        </section>
        
       
        
        
      
        
        
        {/* Section footer avec mots-clés SEO et breadcrumbs */}
        <footer className="mt-12 text-sm text-slate-500 dark:text-slate-400">
          
          
          <p className="mt-6 text-center">© 2025 Calculateur de Contraste. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  )
}



