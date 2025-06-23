import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { WebcamImage, WebcamModule } from 'ngx-webcam';
import { ServicecallService } from '../../../core/services/servicecall.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { TreeGridMatchingRecordsOnlyFilteringStrategy } from 'igniteui-angular';

@Component({
  selector: 'app-servicecallform',
  standalone: true,
  imports: [CommonModule, FormsModule, WebcamModule],
  templateUrl: './servicecallform.component.html',
  styleUrl: './servicecallform.component.scss'
})
export class ServicecallformComponent implements OnInit, OnChanges {
  @Input() orgId: string = '';
  @Input() mode: 'add' | 'edit' | 'view' | 'action' = 'add';
  @Input() check: boolean = true;
  @Input() data: any = null;
  @Input() showsearch:boolean=true;
  @Input() isaction: boolean = false;
  @Input() voucherid: string = '';
  @Input() id:string='';
  @Output() updateNeeded = new EventEmitter<void>();
  selectedVoucherId: string = '';

  serviceCall: any = {
    service_date: '',
    service_name: '',
    customer_name: '',
    customer_number: '',
    service_type: null,
    purpose: '',
    address: '',
    status: 'PENDING',
    assigned_to: '',
    id: null
  };

  actionForm = {
    action_date: '',
    observation: '',
    action_taken: '',
    status: 'PENDING',
    attachment: null as File | null,
    attachmentName: '',
    attachmentPreview: ''
  };

  submitting = false;
  searchValue = '';
  searchResults: any[] = [];
  searching = false;
  orgid: string = '';
  showDropdown = false;
  private searchTimeout: any = null;

  assignedToList: any[] = [];
  loadingAssignees = false;

  showFileTypeModal = false;
  isWebcamOpen = false;
  webcamImage: WebcamImage | null = null;
  private trigger: Subject<void> = new Subject<void>();

  constructor(
    private servicecallService: ServicecallService,
    private org: OrganizationService
  ) {}

  ngOnInit() {
    console.log("this is being recived",this.voucherid);
    if (!this.data || this.mode === 'add') {
      this.serviceCall.service_date = this.getTodayDateString();
    }
    if (this.data) this.patchFormWithData(this.data);
    this.organisation();
    console.log("this is id of voucher ",this.id);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) this.patchFormWithData(this.data);
    if (changes['mode'] && this.mode === 'add') {
      this.resetForm();
    }
  }

  patchFormWithData(data: any) {
    this.serviceCall = {
      service_date: data.service_date || this.getTodayDateString(),
      service_name: data.service_name || '',
      customer_name: data.customer_name || '',
      customer_number: data.customer_number || '',
      service_type: data.service_type || 'SCHEDULED',
      purpose: data.purpose || '',
      address: data.address || '',
      status: data.status || 'PENDING',
      assigned_to: data.user_id || data.assigned_to || '',
      id: data.id || null
    };
    this.selectedVoucherId =
      data.service_voucher_id_form ||
      data.service_voucher_id ||
      data.voucher_id ||
      '';
    this.searchValue = data.customer_name || '';
  }

  resetForm() {
    this.serviceCall = {
      service_date: this.getTodayDateString(),
      service_name: '',
      customer_name: '',
      customer_number: '',
      service_type: 'SCHEDULED',
      purpose: '',
      address: '',
      status: 'PENDING',
      assigned_to: '',
      id: null
    };
    this.searchValue = '';
    this.searchResults = [];
    this.showDropdown = false;
    this.selectedVoucherId = '';
    this.actionForm.attachmentName = '';
    this.actionForm.attachmentPreview = '';
  }

  getTodayDateString(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  organisation() {
    this.org.fetchorginizationid().subscribe(id => {
      this.orgId = id;
      if (this.orgId) {
        this.loadAssignees();
      }
    });
  }

  onSearchInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue = value;

    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    if (value && value.length >= 3) {
      this.searching = true;
      this.showDropdown = true;
      this.searchTimeout = setTimeout(() => {
        this.servicecallService.getservicevoucher(this.orgId, { search: value }).subscribe((res: any) => {
          this.searchResults = Array.isArray(res.data) ? res.data : [];
          this.searching = false;
          this.showDropdown = true;
        }, (error: any) => {
          this.searching = false;
          this.showDropdown = true;
          this.searchResults = [];
        });
      }, 0);
    } else {
      this.showDropdown = false;
      this.searchResults = [];
    }
  }

  // Webcam logic
  openWebcam() {
    this.isWebcamOpen = true;
    this.showFileTypeModal = false;
    this.webcamImage = null;
  }

  closeWebcam() {
    this.isWebcamOpen = false;
  }

  triggerSnapshot(): void {
    this.trigger.next();
  }

  handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.actionForm.attachmentPreview = webcamImage.imageAsDataUrl;
    this.actionForm.attachmentName = 'Captured Image';
    this.actionForm.attachment = null;
    this.isWebcamOpen = false;
  }

  get triggerObservable() {
    return this.trigger.asObservable();
  }

  onFileSelected(event: Event, type: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.actionForm.attachment = file;
      this.actionForm.attachmentName = file.name;
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.actionForm.attachmentPreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.actionForm.attachmentPreview = '';
      }
    }
  }

  openUploadGallery() {
    this.showFileTypeModal = false;
    setTimeout(() => {
      (document.querySelector('#galleryInput') as HTMLInputElement)?.click();
    }, 200);
  }

  openUploadPdf() {
    this.showFileTypeModal = false;
    setTimeout(() => {
      (document.querySelector('#pdfInput') as HTMLInputElement)?.click();
    }, 200);
  }

  onSelectVoucher(option: any) {
    this.selectedVoucherId = option.id;
    this.serviceCall.service_name = option.service_name || '';
    this.serviceCall.customer_name = option.cust_name || '';
    this.serviceCall.customer_number = option.cust_mobile || option.contact_number || '';
    this.serviceCall.address = option.address || '';
    this.serviceCall.status = option.status || 'PENDING';
    this.searchValue = option.cust_name + ' (' + (option.cust_mobile || option.contact_number) + ')';
    this.showDropdown = false;
  }

  loadAssignees() {
    this.loadingAssignees = true;
    this.assignedToList = [];
    this.servicecallService.getusers(this.orgId).subscribe(
      (res: any) => {
        this.assignedToList = Array.isArray(res) ? res : [];
        this.loadingAssignees = false;
      },
      (err: any) => {
        this.loadingAssignees = false;
        this.assignedToList = [];
      }
    );
  }
  openFileTypeModal() {
    this.showFileTypeModal = true;
    this.isWebcamOpen = false;
  }
  closeFileTypeModal() {
    this.showFileTypeModal = false;
  }

  // Utility: convert dataURL to Blob for webcam images
  dataURLtoBlob(dataurl: string): Blob {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  onSubmit(form: any) {
    if (this.isaction || this.mode === 'action') {
      const act = this.actionForm;
      if (!act.action_date || !act.observation || !act.action_taken || !act.status) {
        Object.values(form.controls).forEach((control: any) => control.markAsTouched && control.markAsTouched());
        return;
      }
      this.submitting = true;
      if (act.attachment || act.attachmentPreview) {
        const formData = new FormData();
        if (act.attachment) {
          formData.append('attachment', act.attachment, act.attachmentName);
          formData.append('owner_type','SERVICE_CALLS')
        } else if (act.attachmentPreview) {
          const blob = this.dataURLtoBlob(act.attachmentPreview);
          formData.append('attachment', blob, 'webcam.jpg');
          formData.append('owner_type','SERVICE_CALLS');
        }
        this.servicecallService.addattachment(formData).subscribe({
          next: (attachRes) => {
            const attachment_id = attachRes?.attachment_id || attachRes?.id || null;
            this.completeActionWithAttachment(attachment_id);
          },
          error: () => {
            this.submitting = false;
            alert('Attachment upload failed');
          }
        });
      } else {
        this.completeActionWithAttachment(null);
      }
      return;
    }

    if (form.invalid || this.mode === 'view') return;
    this.submitting = true;

    const payload = {
      completion_date: this.serviceCall.service_date,
      description: null,
      purpose: this.serviceCall.purpose || null,
      service_date: this.serviceCall.service_date,
      service_type: this.serviceCall.service_type,
      service_voucher_id_form: this.selectedVoucherId,
      user_id: this.serviceCall.assigned_to || null
    };

    const orgid = this.orgId;
    const vid = this.selectedVoucherId || this.voucherid||this.id;

    if (!vid) {
      alert('Please select a service voucher.');
      this.submitting = false;
      return;
    }

    if (this.mode === 'add') {
      this.servicecallService.schedulecall(orgid, vid, payload).subscribe(
        (res) => {
          this.submitting = false;
          this.updateNeeded.emit();
        },
        (err) => {
          this.submitting = false;
          alert('Error adding call');
        }
      );
    } else if (this.mode === 'edit') {
      const id = this.serviceCall.id;
      this.servicecallService.editcall(orgid, vid, payload, id).subscribe(
        (res) => {
          this.submitting = false;
          this.updateNeeded.emit();
        },
        (err) => {
          this.submitting = false;
          alert('Error adding call');
        }
      );
    }
  }

  completeActionWithAttachment(attachment_id: string | null) {
  const id = this.serviceCall.id;
  const vid = this.selectedVoucherId || this.voucherid;
  const orgid = this.orgId;
  const act = this.actionForm;
  const payload = {
    action_date: act.action_date,
    action_note: act.action_taken,
    attachment_id: attachment_id,
    image_bill_document: null,
    observation: act.observation,
    pdf_bill_document: null,
    status: act.status?.toUpperCase()
  };

  // Debug
  console.log('orgid:', orgid);
  console.log('vid:', vid);
  console.log('id:', id);
  console.log('payload:', payload);

  if (!vid) {
    alert('No voucher ID');
    this.submitting = false;
    return;
  }
  if (!id) {
    alert('No service call ID');
    this.submitting = false;
    return;
  }

  this.servicecallService.saveaction(orgid, vid, id, payload).subscribe(
    () => {
      this.submitting = false;
      this.updateNeeded.emit();
    },
    () => {
      this.submitting = false;
      alert('Error completing action');
    }
  );
}
}