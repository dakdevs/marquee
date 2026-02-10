import { useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import { Dialog } from "@base-ui-components/react/dialog";
import { Select } from "@base-ui-components/react/select";
import type { TemplateType } from "../../types.ts";
import {
  allTemplateTypes,
  templateLabels,
  getDefaultProps,
} from "../lib/template-config.ts";
import { FormField } from "./ui/form-field.tsx";

export function AddOverlayModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (
    label: string,
    template: TemplateType,
    props: Record<string, string>,
  ) => void;
}) {
  const [label, setLabel] = useState("");
  const [template, setTemplate] = useState<TemplateType>("lower-third");

  function handleCreate() {
    onCreate(label || "Untitled", template, getDefaultProps(template));
    setLabel("");
    setTemplate("lower-third");
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="modal-overlay fixed inset-0 bg-[rgba(9,9,11,0.8)] backdrop-blur-[4px] z-[100]" />
        <Dialog.Popup className="modal fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#111113] border border-[#27272a] rounded-lg p-5 w-80 flex flex-col gap-2.5 z-[101] shadow-[0_0_40px_rgba(0,0,0,0.4)] overscroll-contain transition-[opacity,transform] duration-150 ease-in-out">
          <Dialog.Title className="text-sm font-semibold mb-0.5">
            Add Overlay
          </Dialog.Title>
          <FormField label="Label">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Host Lower Third…"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              className="w-full px-2.5 py-[7px] bg-[#111113] border border-[#27272a] rounded text-[#fafafa] font-mono text-xs outline-none transition-[border-color] duration-150 ease-in-out focus:border-[#3f3f46] focus-visible:border-[#818cf8] focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] focus-visible:outline-none"
            />
          </FormField>
          <FormField label="Template">
            <Select.Root
              value={template}
              onValueChange={(val) => setTemplate(val as TemplateType)}
            >
              <Select.Trigger className="flex items-center justify-between gap-1.5 w-full px-2.5 py-[7px] bg-[#111113] border border-[#27272a] rounded text-[#fafafa] font-mono text-xs cursor-pointer outline-none transition-[border-color] duration-150 ease-in-out focus:border-[#3f3f46] focus-visible:border-[#818cf8] focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] focus-visible:outline-none">
                <Select.Value />
                <Select.Icon className="flex items-center text-[#52525b]">
                  <ChevronDown size={12} aria-hidden="true" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner className="select-positioner">
                  <Select.Popup className="select-popup">
                    {allTemplateTypes.map((t) => (
                      <Select.Item key={t} value={t} className="select-item">
                        <Select.ItemText>{templateLabels[t]}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </FormField>
          <div className="flex gap-1.5 mt-1.5">
            <button
              className="inline-flex items-center gap-[5px] px-4 py-2 font-mono text-[11px] font-semibold rounded-[5px] cursor-pointer transition-[background,opacity,transform,border-color] duration-150 ease-in-out active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] bg-[#18181b] text-[#fafafa] border border-[#27272a] hover:bg-[#1e1e22] hover:border-[#3f3f46]"
              onClick={onClose}
            >
              <X size={14} aria-hidden="true" />
              Cancel
            </button>
            <button
              className="inline-flex items-center gap-[5px] px-4 py-2 font-mono text-[11px] font-semibold border-none rounded-[5px] cursor-pointer transition-[background,opacity,transform] duration-150 ease-in-out active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] bg-white text-[#09090b] flex-1 hover:opacity-90"
              onClick={handleCreate}
            >
              <Plus size={14} aria-hidden="true" />
              Create
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
