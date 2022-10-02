export interface InstructionEvents {
  onBeforeCreateInstruction?: Function;
  onCreateNeonAccountInstruction?: Function;
  onBeforeSignTransaction?: Function;
  onBeforeNeonSign?: Function;
  onSuccessSign?: Function;
  onErrorSign?: Function;
}
