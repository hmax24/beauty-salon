type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Service</h1>
      <p className="mt-2 text-gray-600">
        locale: <span className="font-mono">{locale}</span>
      </p>
      <p className="mt-1 text-gray-600">
        slug: <span className="font-mono">{slug}</span>
      </p>
    </div>
  );
}