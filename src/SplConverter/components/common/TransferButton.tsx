import './TransferButton.scss'
import {Direction} from "@/contexts/models";
import {useTransferring} from "@/SplConverter/hooks/transfering";
import {useStatesContext} from "@/contexts/states";
import {useEffect, useState} from "react";
import {useToast} from "@/common/Notifications";

interface TransformButtonProps {
  disabled: boolean
}

export function TransferButton ({ disabled }: TransformButtonProps) {
  const { amount, token, direction, error, pending } = useStatesContext();
  const { deposit, withdraw } = useTransferring();
  const [loading, setLoading] = useState<boolean>(false);
  const { addToast } = useToast();
  let prevError = '';

  const handleConfirmTransfer = () => {
    setLoading(true);

    switch (direction) {
      case Direction.neon:
        deposit(amount, token).then(() => setLoading(false));
        break;
      case Direction.solana:
        withdraw(amount, token).then(() => setLoading(false));
        break;
    }
  };

  useEffect(() => {
    if (error && prevError !== error) {
      prevError = error;
      addToast(error, 'ERROR');
    }
  }, [error])

  return (
    <button
      onClick={handleConfirmTransfer}
      disabled={pending || disabled || loading}
      className={`${pending || disabled ? 'transfer-button--disabled' : ''}
      w-full transfer-button py-5 mt-[30px] rounded-[8px] text-base-2 tracking-tighten font-bold`}
    >
      Transfer
    </button>
  )
}

