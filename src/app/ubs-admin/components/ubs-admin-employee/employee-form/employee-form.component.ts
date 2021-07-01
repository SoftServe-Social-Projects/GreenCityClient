import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EmployeeService } from '../../../services/employee.service';
export interface Position {
  name: string;
}
@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  @Input()
  locations;
  roles;
  selectedFile: File;
  filePath: string;
  uploaded: boolean = false;
  employeeForm: FormGroup;
  positionsArr = [];
  ngOnInit() {
    this.employeeService.getAllPositions().subscribe({
      next: (roles) => {
        this.roles = roles;
      }
    });
    this.employeeService.getAllStantions().subscribe({
      next: (locations) => {
        this.locations = locations;
      }
    });
  }
  constructor(private employeeService: EmployeeService, public fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data) {
    this.employeeForm = this.fb.group({
      //remove image from this place
      image: [this.data.image],
      firstName: [this.data.name],
      lastName: [this.data.surname],
      phoneNumber: [this.data.phoneNumber],
      email: [this.data.email],
      employeePositions: this.fb.array([]),
      receivingStations: this.fb.array([])
    });
  }

  onCheckChangeRole(data) {
    const formLocationArray: FormArray = this.employeeForm.get('employeePositions') as FormArray;
    formLocationArray.push(new FormControl(data));
  }
  onCheckChangeLocation(data) {
    const formLocationArray: FormArray = this.employeeForm.get('receivingStations') as FormArray;
    formLocationArray.push(new FormControl(data));
  }
  imagePreview(e) {
    this.selectedFile = (e.target as HTMLInputElement).files[0];
    this.employeeForm.patchValue({
      img: this.selectedFile
    });
    this.employeeForm.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.filePath = reader.result as string;
    };
    reader.readAsDataURL(this.selectedFile);
    this.uploaded = true;
  }
  submit() {
    const formData: any = new FormData();
    const addEmployeeDto = new Blob([JSON.stringify(this.employeeForm.value)], { type: 'application/json' });
    formData.append('addEmployeeDto', addEmployeeDto);
    formData.append('image', this.selectedFile);
    this.employeeService.postEmployee(formData).subscribe((res) => console.log(res));
  }
}
