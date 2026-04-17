import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BrnDialogClose, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { SettingValueType } from '../../models/setting.models';

interface SettingUpdateConfirmDialogContext {
  key: string;
  value: string;
  valueType: SettingValueType;
  notes: string | null;
  close: (result?: boolean) => void;
}

@Component({
  selector: 'app-setting-update-confirm-dialog',
  imports: [BrnDialogClose],
  templateUrl: './setting-update-confirm-dialog.html',
  styleUrl: './setting-update-confirm-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingUpdateConfirmDialogComponent {
  private readonly dialogContext = injectBrnDialogContext<SettingUpdateConfirmDialogContext>();

  protected readonly key = this.dialogContext.key;
  protected readonly value = this.dialogContext.value;
  protected readonly valueType = this.dialogContext.valueType;
  protected readonly notes = this.dialogContext.notes;

  protected confirm(): void {
    this.dialogContext.close(true);
  }
}