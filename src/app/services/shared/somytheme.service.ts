import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { StyleManagerService } from "./style-manager.service";

@Injectable({ providedIn: 'root' })
export class SomythemeService {
  constructor(private http: HttpClient,
    private styleManager: StyleManagerService
  ) { }

  setTheme(themeToSet) {
    this.styleManager.setStyle(
      "theme",
      `assets/css/${themeToSet}.css`
    );
  }
}
