"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { CREATE_COMPANION_MUTATION, GET_CATEGORIES } from "@/lib/queries";
import { uploadImages } from "@/lib/upload";
import { LockIcon } from "@/components/icons/LockIcon";
import type {
  CreateCompanionData,
  CreateCompanionInput,
  GetCategoriesData,
  ImageUploadResult,
} from "@/lib/types";

const CITIES = ["Miami", "New York", "Los Angeles", "Las Vegas", "Chicago", "Houston", "Dallas", "Atlanta", "Bogotá", "Medellín", "Cali"];
const ETHNICITIES = ["Latina", "Europea", "Asiática", "Africana", "Árabe", "Mixta"];
const BODY_TYPES = ["Delgada", "Atlética", "Curvilínea", "Petite"];
const HAIR_COLORS = ["Rubia", "Castaña", "Negra", "Pelirroja", "Cobriza"];
const EYE_COLORS = ["Marrones", "Azules", "Verdes", "Avellana"];
const CURRENCIES = ["USD", "COP", "EUR"];

interface LocalImage {
  file: File;
  preview: string;
  isPrimary: boolean;
}

interface FormState {
  name: string;
  age: string;
  bio: string;
  tagline: string;
  ethnicity: string;
  bodyType: string;
  hairColor: string;
  eyeColor: string;
  height: string;
  languages: string[];
  services: string[];
  tags: string[];
  availability: string;
  city: string;
  region: string;
  country: string;
  pricePerHour: string;
  currency: string;
  categoryIds: string[];
}

interface FormErrors {
  [field: string]: string;
}

function validate(form: FormState, images: LocalImage[]): FormErrors {
  const errors: FormErrors = {};
  if (!form.name || form.name.length < 2) errors.name = "Nombre requerido (mín. 2 caracteres)";
  if (!form.age || parseInt(form.age) < 18) errors.age = "Edad mínima 18 años";
  if (form.age && parseInt(form.age) > 99) errors.age = "Edad máxima 99 años";
  if (!form.city) errors.city = "Ciudad requerida";
  if (!form.country) errors.country = "País requerido";
  if (images.length === 0) errors.images = "Al menos una imagen requerida";
  else if (!images.some((i) => i.isPrimary)) errors.images = "Marca una imagen como principal";
  return errors;
}

function TagInput({
  label,
  tags,
  onChange,
  suggestions,
  placeholder,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-sm text-charcoal"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="ml-0.5 text-warm-gray hover:text-charcoal"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(input);
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions
            .filter((s) => !tags.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="rounded-full border border-sand px-2.5 py-1 text-xs text-warm-gray transition hover:border-gold hover:text-charcoal"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export default function PublishPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    age: "",
    bio: "",
    tagline: "",
    ethnicity: "",
    bodyType: "",
    hairColor: "",
    eyeColor: "",
    height: "",
    languages: [],
    services: [],
    tags: [],
    availability: "",
    city: "",
    region: "",
    country: "CO",
    pricePerHour: "",
    currency: "USD",
    categoryIds: [],
  });

  const [images, setImages] = useState<LocalImage[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: categoriesData } = useQuery<GetCategoriesData>(GET_CATEGORIES);
  const [createCompanion, { loading: submitting }] = useMutation<CreateCompanionData>(
    CREATE_COMPANION_MUTATION
  );

  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImages: LocalImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) continue;
      newImages.push({
        file,
        preview: URL.createObjectURL(file),
        isPrimary: false,
      });
    }
    setImages((prev) => {
      const combined = [...prev, ...newImages].slice(0, 10);
      if (combined.length > 0 && !combined.some((i) => i.isPrimary)) {
        combined[0].isPrimary = true;
      }
      return combined;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.images;
      return next;
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      if (next.length > 0 && !next.some((i) => i.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  }, []);

  const setPrimary = useCallback((index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validate(form, images);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setUploading(true);
      const uploadResults: ImageUploadResult[] = await uploadImages(
        images.map((i) => i.file)
      );
      setUploading(false);

      const input: CreateCompanionInput = {
        name: form.name,
        age: parseInt(form.age),
        bio: form.bio || null,
        tagline: form.tagline || null,
        ethnicity: form.ethnicity || null,
        bodyType: form.bodyType || null,
        hairColor: form.hairColor || null,
        eyeColor: form.eyeColor || null,
        height: form.height ? parseInt(form.height) : null,
        languages: form.languages,
        services: form.services,
        tags: form.tags,
        availability: form.availability || null,
        city: form.city,
        region: form.region || null,
        country: form.country,
        pricePerHour: form.pricePerHour ? Math.round(parseFloat(form.pricePerHour) * 100) : null,
        currency: form.currency,
        categoryIds: form.categoryIds,
        images: uploadResults.map((result, i) => ({
          ...result,
          position: i,
          isPrimary: images[i].isPrimary,
        })),
      };

      const { data } = await createCompanion({ variables: { input } });
      if (data) {
        router.push(`/companion/${data.createCompanion.id}`);
      }
    } catch (err) {
      setUploading(false);
      setSubmitError(err instanceof Error ? err.message : "Error al publicar perfil");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <div className="mx-auto max-w-3xl px-5 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-sand/50" />
            <div className="h-64 rounded-2xl bg-sand/30" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <div className="mx-auto max-w-sm rounded-2xl border border-sand/80 bg-white p-8">
            <LockIcon className="mx-auto h-12 w-12 text-sand" />
            <h2 className="mt-4 text-xl font-semibold text-espresso">Inicia sesión</h2>
            <p className="mt-2 text-sm text-warm-gray">
              Debes iniciar sesión para publicar tu perfil.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const categories = categoriesData?.categories ?? [];
  const isSubmitting = uploading || submitting;

  return (
    <div className="min-h-screen bg-ivory">
      <Header />

      <div className="mx-auto max-w-3xl px-5 py-8">
        <div className="mb-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Nuevo Perfil
          </span>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-espresso sm:text-3xl">
            Publicar tu Perfil
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <section className="rounded-2xl border border-sand/80 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-espresso">Fotos</h2>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {images.map((img, i) => (
                <div key={img.preview} className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-cream">
                  <img src={img.preview} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 rounded-full bg-black/50 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrimary(i)}
                    className={`absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                      img.isPrimary
                        ? "bg-gold text-white"
                        : "bg-black/40 text-white/70 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {img.isPrimary ? "Principal" : "Hacer principal"}
                  </button>
                </div>
              ))}

              {images.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border-2 border-dashed border-sand transition hover:border-gold hover:bg-gold/5"
                >
                  <svg className="h-6 w-6 text-warm-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="mt-1 text-[10px] font-medium text-warm-gray">Agregar</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <p className="mt-3 text-xs text-warm-gray">
              Máximo 10 fotos, 5MB cada una. JPEG, PNG o WebP.
            </p>
            {errors.images && (
              <p className="mt-1 text-xs text-red-500">{errors.images}</p>
            )}
          </section>

          {/* Basic Info */}
          <section className="rounded-2xl border border-sand/80 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-espresso">Información Básica</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
                  Nombre *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  maxLength={50}
                  className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
                  Edad *
                </label>
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={form.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
                />
                {errors.age && <p className="mt-1 text-xs text-red-500">{errors.age}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
                  Eslogan
                </label>
                <input
                  value={form.tagline}
                  onChange={(e) => updateField("tagline", e.target.value)}
                  placeholder="Ej: Acompañante exclusiva y elegante"
                  className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
                  Sobre mí
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={4}
                  placeholder="Describe tu perfil, personalidad, lo que ofreces..."
                  className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Physical Attributes */}
          <section className="rounded-2xl border border-sand/80 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-espresso">Atributos Físicos</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SelectField label="Etnia" value={form.ethnicity} options={ETHNICITIES} onChange={(v) => updateField("ethnicity", v)} />
              <SelectField label="Contextura" value={form.bodyType} options={BODY_TYPES} onChange={(v) => updateField("bodyType", v)} />
              <SelectField label="Color de Cabello" value={form.hairColor} options={HAIR_COLORS} onChange={(v) => updateField("hairColor", v)} />
              <SelectField label="Color de Ojos" value={form.eyeColor} options={EYE_COLORS} onChange={(v) => updateField("eyeColor", v)} />
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
                  Estatura (cm)
                </label>
                <input
                  type="number"
                  min={100}
                  max={220}
                  value={form.height}
                  onChange={(e) => updateField("height", e.target.value)}
                  placeholder="165"
                  className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="rounded-2xl border border-sand/80 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-espresso">Ubicación</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
                  Ciudad *
                </label>
                <select
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
                >
                  <option value="">Seleccionar ciudad</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
                  Región
                </label>
                <input
                  value={form.region}
                  onChange={(e) => updateField("region", e.target.value)}
                  placeholder="Ej: Antioquia, Florida"
                  className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
                  País *
                </label>
                <select
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
                >
                  <option value="CO">Colombia</option>
                  <option value="US">Estados Unidos</option>
                  <option value="MX">México</option>
                  <option value="ES">España</option>
                  <option value="AR">Argentina</option>
                </select>
                {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country}</p>}
              </div>
            </div>
          </section>

          {/* Services & Languages */}
          <section className="rounded-2xl border border-sand/80 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-espresso">Servicios e Idiomas</h2>
            <div className="space-y-5">
              <TagInput
                label="Idiomas"
                tags={form.languages}
                onChange={(v) => updateField("languages", v)}
                suggestions={["Español", "Inglés", "Portugués", "Francés", "Italiano"]}
                placeholder="Agregar idioma..."
              />
              <TagInput
                label="Servicios"
                tags={form.services}
                onChange={(v) => updateField("services", v)}
                suggestions={["Dinner Date", "Events", "Travel", "Companionship", "Massage"]}
                placeholder="Agregar servicio..."
              />
              <TagInput
                label="Etiquetas"
                tags={form.tags}
                onChange={(v) => updateField("tags", v)}
                suggestions={["rubia", "morena", "ojosverdes", "fitness", "universitaria", "ejecutiva", "viajes", "bilingue"]}
                placeholder="Agregar etiqueta... ej: #rubia"
              />
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
                  Disponibilidad
                </label>
                <input
                  value={form.availability}
                  onChange={(e) => updateField("availability", e.target.value)}
                  placeholder="Ej: Disponible, Fines de Semana, Previa cita"
                  className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
                />
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-2xl border border-sand/80 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-espresso">Tarifa</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
                  Precio por hora
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-gray">
                    {form.currency === "USD" ? "$" : form.currency}
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.pricePerHour}
                    onChange={(e) => updateField("pricePerHour", e.target.value)}
                    placeholder="150"
                    className="w-full rounded-lg border border-sand bg-white py-2.5 pl-8 pr-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
                  />
                </div>
              </div>
              <SelectField label="Moneda" value={form.currency} options={CURRENCIES} onChange={(v) => updateField("currency", v)} />
            </div>
          </section>

          {/* Categories */}
          {categories.length > 0 && (
            <section className="rounded-2xl border border-sand/80 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-espresso">Categorías</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const selected = form.categoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        updateField(
                          "categoryIds",
                          selected
                            ? form.categoryIds.filter((id) => id !== cat.id)
                            : [...form.categoryIds, cat.id]
                        );
                      }}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        selected
                          ? "border-gold bg-gold/10 text-espresso"
                          : "border-sand bg-white text-warm-gray hover:border-gold hover:text-charcoal"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Submit */}
          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-3 pb-12">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-sand px-6 py-3 text-sm font-medium text-charcoal transition hover:border-charcoal"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-espresso px-8 py-3 text-sm font-semibold text-ivory transition hover:bg-charcoal disabled:opacity-50"
            >
              {uploading
                ? "Subiendo fotos..."
                : submitting
                ? "Publicando..."
                : "Publicar Perfil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-1 focus:ring-gold/30"
      >
        <option value="">Seleccionar</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
