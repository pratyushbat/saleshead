import { Directive, Input, IterableChangeRecord, IterableDiffer, IterableDiffers, TemplateRef, ViewContainerRef, ViewRef } from '@angular/core';

@Directive({
  selector: '[ngxtFor]'
})
export class NgxtForDirective {
  private items: any[] = [];
  private viewRefsMap: Map<any, ViewRef> = new Map<any, ViewRef>();
  private _diffrence: IterableDiffer<any> | undefined;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private differs: IterableDiffers
  ) { }

  @Input('ngxtForOf')
  public set ngxtForOf(items: any) {
    this.items = items;
    if (items) {
      this._diffrence = this.differs.find(items).create();
    }
    //Clear any existing items
    this.viewContainer.clear();
  }

  @Input('ngxtForItemsAtOnce')
  public itemsAtOnce: number = 3;

  @Input('ngxtForIntervalLength')
  public intervalLength: number = 50;

  public ngDoCheck(): void {
    if (this._diffrence) {
      const changes = this._diffrence.diff(this.items);
      if (changes) {
        const itemsAdded: any[] = [];
        changes.forEachAddedItem(item => {
          itemsAdded.push(item);
        });

        this.progressiveRender(itemsAdded);

        changes.forEachRemovedItem(item => {
          const mapView = this.viewRefsMap.get(item.item) as ViewRef;
          const viewIndex = this.viewContainer.indexOf(mapView);
          this.viewContainer.remove(viewIndex);
          this.viewRefsMap.delete(item.item);
        });
      }
    }
  }

  private progressiveRender(items: IterableChangeRecord<any>[]) {
    let interval: any;
    let start = 0;
    let end = start + this.itemsAtOnce;
    if (end > items.length) {
      end = items.length;
    }
    this.renderItems(items, start, end);

    interval = setInterval(() => {
      start = end;
      end = start + this.itemsAtOnce;
      if (end > items.length) {
        end = items.length;
      }
      this.renderItems(items, start, end);
      if (start >= items.length) {
        clearInterval(interval);
      }
    }, this.intervalLength);
  }

  private renderItems(
    items: IterableChangeRecord<any>[],
    start: number,
    end: number
  ) {
    items.slice(start, end).forEach(item => {
      const embeddedView = this.viewContainer.createEmbeddedView(
        this.templateRef,
        {
          $implicit: item.item
        },
        item.currentIndex || 0
      );
      this.viewRefsMap.set(item.item, embeddedView);
    });
  }
}
