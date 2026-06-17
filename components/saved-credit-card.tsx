'use client';

import '@/app/(consumer)/metodos-pagamento/payment-card.css';
import { CardBrandLogo } from '@/components/card-brand-logo';
import { Badge } from '@/components/ui/badge';
import { SavedPaymentCard } from '@/lib/types/wallet';

interface SavedCreditCardProps {
  card: SavedPaymentCard;
}

export function SavedCreditCard({ card }: SavedCreditCardProps) {
  return (
    <section className="payment-card payment-card--saved">
      <section className="payment-card__front">
        <div className="payment-card__header">
          <div className="payment-card__header-start">
            {card.isDefault && (
              <Badge className="border-white/30 bg-white/15 text-white hover:bg-white/15">
                Padrão
              </Badge>
            )}
          </div>
          <div className="payment-card__brand-slot">
            <CardBrandLogo brand={card.brand} />
          </div>
        </div>

        <div className="payment-card__field payment-card__field--number">
          <div className="payment-card__number payment-card__number--static">
            <span className="payment-card__number-group">••••</span>
            <span className="payment-card__number-group">••••</span>
            <span className="payment-card__number-group">••••</span>
            <span className="payment-card__number-group">{card.lastFour}</span>
          </div>
        </div>

        <div className="payment-card__footer">
          <div className="payment-card__field payment-card__field--holder">
            <div className="payment-card__holder">
              <div className="payment-card__section-title">Titular</div>
              <div className="payment-card__holder-name">{card.holderName}</div>
            </div>
          </div>

          <div className="payment-card__field payment-card__field--expire">
            <div className="payment-card__expires">
              <div className="payment-card__section-title">Validade</div>
              <div className="payment-card__expires-value payment-card__expires-value--static">
                <span>{card.expiryMonth ?? '••'}</span>
                <span className="payment-card__expires-sep">/</span>
                <span>{card.expiryYear ?? '••'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
