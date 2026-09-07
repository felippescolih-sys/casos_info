import { useAuth } from '@/auth/AuthProvider';
import { Card, CardBody } from '@/components/ui/Card';

export function DashboardPage() {
  const { membro } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Olá, {membro?.nome.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-500">Bem-vindo ao Casos Info.</p>
      </div>
      <Card>
        <CardBody>
          <p className="text-sm text-gray-600">
            A migração está sendo feita por partes. Já disponível:{' '}
            <strong>login, gestão de membros</strong> e a{' '}
            <a href="/casos" className="font-medium text-brand-700 hover:underline">
              consulta de casos
            </a>{' '}
            (importados do Bubble, só leitura por enquanto).
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
