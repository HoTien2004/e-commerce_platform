import { useEffect, useState, useRef } from 'react';
import { useCartModalStore } from '../store/cartModalStore';
import CartSuccessModal from './CartSuccessModal';

const CartSuccessModalStack = () => {
  const { modals, removeModal } = useCartModalStore();
  const [offsetTop, setOffsetTop] = useState<number>(92); // fallback: header ~80px + 12px
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const updateOffset = () => {
      if (typeof window === 'undefined') return;

      const headerEl = document.querySelector('header');
      if (headerEl) {
        const rect = headerEl.getBoundingClientRect();
        // luôn cách phần header đang thấy 12px
        setOffsetTop(rect.bottom + 12);
      } else {
        setOffsetTop(92);
      }
    };

    updateOffset();
    window.addEventListener('resize', updateOffset);
    window.addEventListener('scroll', updateOffset);

    return () => {
      window.removeEventListener('resize', updateOffset);
      window.removeEventListener('scroll', updateOffset);
    };
  }, []);

  useEffect(() => {
    // Clear all existing timeouts
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRefs.current.clear();

    // Set new timeouts for each modal
    modals.forEach((modal) => {
      const timer = setTimeout(() => {
        removeModal(modal.id);
        timeoutRefs.current.delete(modal.id);
      }, 1000);
      timeoutRefs.current.set(modal.id, timer);
    });

    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, [modals, removeModal]);

  if (modals.length === 0) return null;

  return (
    <div className="fixed right-4 z-50" style={{ top: offsetTop }}>
      <div className="flex flex-col gap-3">
        {modals.map((modal) => {
          return (
            <div
              key={modal.id}
              className="animate-slide-in-right"
            >
              <CartSuccessModal
                product={modal.product}
                quantity={modal.quantity}
                isOpen={true}
                onClose={() => {
                  // Clear timeout if manually closed
                  const timeout = timeoutRefs.current.get(modal.id);
                  if (timeout) {
                    clearTimeout(timeout);
                    timeoutRefs.current.delete(modal.id);
                  }
                  removeModal(modal.id);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartSuccessModalStack;

