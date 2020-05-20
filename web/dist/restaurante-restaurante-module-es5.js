(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["restaurante-restaurante-module"], {
        /***/ "./node_modules/@angular/cdk/esm2015/drag-drop.js": 
        /*!********************************************************!*\
          !*** ./node_modules/@angular/cdk/esm2015/drag-drop.js ***!
          \********************************************************/
        /*! exports provided: DragDrop, DragRef, DropListRef, CdkDropList, CDK_DROP_LIST, CDK_DROP_LIST_CONTAINER, moveItemInArray, transferArrayItem, copyArrayItem, DragDropModule, DragDropRegistry, CdkDropListGroup, CDK_DRAG_CONFIG_FACTORY, CDK_DRAG_CONFIG, CdkDrag, CdkDragHandle, CdkDragPreview, CdkDragPlaceholder, ɵb */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DragDrop", function () { return DragDrop; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DragRef", function () { return DragRef; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DropListRef", function () { return DropListRef; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CdkDropList", function () { return CdkDropList; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CDK_DROP_LIST", function () { return CDK_DROP_LIST; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CDK_DROP_LIST_CONTAINER", function () { return CDK_DROP_LIST_CONTAINER; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveItemInArray", function () { return moveItemInArray; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transferArrayItem", function () { return transferArrayItem; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copyArrayItem", function () { return copyArrayItem; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DragDropModule", function () { return DragDropModule; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DragDropRegistry", function () { return DragDropRegistry; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CdkDropListGroup", function () { return CdkDropListGroup; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CDK_DRAG_CONFIG_FACTORY", function () { return CDK_DRAG_CONFIG_FACTORY; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CDK_DRAG_CONFIG", function () { return CDK_DRAG_CONFIG; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CdkDrag", function () { return CdkDrag; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CdkDragHandle", function () { return CdkDragHandle; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CdkDragPreview", function () { return CdkDragPreview; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CdkDragPlaceholder", function () { return CdkDragPlaceholder; });
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ɵb", function () { return CDK_DRAG_PARENT; });
            /* harmony import */ var _angular_cdk_platform__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/cdk/platform */ "./node_modules/@angular/cdk/esm2015/platform.js");
            /* harmony import */ var _angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/cdk/coercion */ "./node_modules/@angular/cdk/esm2015/coercion.js");
            /* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm2015/index.js");
            /* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm2015/operators/index.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm2015/common.js");
            /* harmony import */ var _angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/cdk/scrolling */ "./node_modules/@angular/cdk/esm2015/scrolling.js");
            /* harmony import */ var _angular_cdk_bidi__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/cdk/bidi */ "./node_modules/@angular/cdk/esm2015/bidi.js");
            /**
             * @license
             * Copyright Google LLC All Rights Reserved.
             *
             * Use of this source code is governed by an MIT-style license that can be
             * found in the LICENSE file at https://angular.io/license
             */
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Shallow-extends a stylesheet object with another stylesheet object.
             * \@docs-private
             * @param {?} dest
             * @param {?} source
             * @return {?}
             */
            function extendStyles(dest, source) {
                for (var key in source) {
                    if (source.hasOwnProperty(key)) {
                        dest[key] = ( /** @type {?} */(source[key]));
                    }
                }
                return dest;
            }
            /**
             * Toggles whether the native drag interactions should be enabled for an element.
             * \@docs-private
             * @param {?} element Element on which to toggle the drag interactions.
             * @param {?} enable Whether the drag interactions should be enabled.
             * @return {?}
             */
            function toggleNativeDragInteractions(element, enable) {
                /** @type {?} */
                var userSelect = enable ? '' : 'none';
                extendStyles(element.style, {
                    touchAction: enable ? '' : 'none',
                    webkitUserDrag: enable ? '' : 'none',
                    webkitTapHighlightColor: enable ? '' : 'transparent',
                    userSelect: userSelect,
                    msUserSelect: userSelect,
                    webkitUserSelect: userSelect,
                    MozUserSelect: userSelect
                });
            }
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Parses a CSS time value to milliseconds.
             * @param {?} value
             * @return {?}
             */
            function parseCssTimeUnitsToMs(value) {
                // Some browsers will return it in seconds, whereas others will return milliseconds.
                /** @type {?} */
                var multiplier = value.toLowerCase().indexOf('ms') > -1 ? 1 : 1000;
                return parseFloat(value) * multiplier;
            }
            /**
             * Gets the transform transition duration, including the delay, of an element in milliseconds.
             * @param {?} element
             * @return {?}
             */
            function getTransformTransitionDurationInMs(element) {
                /** @type {?} */
                var computedStyle = getComputedStyle(element);
                /** @type {?} */
                var transitionedProperties = parseCssPropertyValue(computedStyle, 'transition-property');
                /** @type {?} */
                var property = transitionedProperties.find(( /**
                 * @param {?} prop
                 * @return {?}
                 */function (/**
                 * @param {?} prop
                 * @return {?}
                 */ prop) { return prop === 'transform' || prop === 'all'; }));
                // If there's no transition for `all` or `transform`, we shouldn't do anything.
                if (!property) {
                    return 0;
                }
                // Get the index of the property that we're interested in and match
                // it up to the same index in `transition-delay` and `transition-duration`.
                /** @type {?} */
                var propertyIndex = transitionedProperties.indexOf(property);
                /** @type {?} */
                var rawDurations = parseCssPropertyValue(computedStyle, 'transition-duration');
                /** @type {?} */
                var rawDelays = parseCssPropertyValue(computedStyle, 'transition-delay');
                return parseCssTimeUnitsToMs(rawDurations[propertyIndex]) +
                    parseCssTimeUnitsToMs(rawDelays[propertyIndex]);
            }
            /**
             * Parses out multiple values from a computed style into an array.
             * @param {?} computedStyle
             * @param {?} name
             * @return {?}
             */
            function parseCssPropertyValue(computedStyle, name) {
                /** @type {?} */
                var value = computedStyle.getPropertyValue(name);
                return value.split(',').map(( /**
                 * @param {?} part
                 * @return {?}
                 */function (/**
                 * @param {?} part
                 * @return {?}
                 */ part) { return part.trim(); }));
            }
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Options that can be used to bind a passive event listener.
             * @type {?}
             */
            var passiveEventListenerOptions = Object(_angular_cdk_platform__WEBPACK_IMPORTED_MODULE_0__["normalizePassiveListenerOptions"])({ passive: true });
            /**
             * Options that can be used to bind an active event listener.
             * @type {?}
             */
            var activeEventListenerOptions = Object(_angular_cdk_platform__WEBPACK_IMPORTED_MODULE_0__["normalizePassiveListenerOptions"])({ passive: false });
            /**
             * Time in milliseconds for which to ignore mouse events, after
             * receiving a touch event. Used to avoid doing double work for
             * touch devices where the browser fires fake mouse events, in
             * addition to touch events.
             * @type {?}
             */
            var MOUSE_EVENT_IGNORE_TIME = 800;
            /**
             * Reference to a draggable item. Used to manipulate or dispose of the item.
             * \@docs-private
             * @template T
             */
            var DragRef = /** @class */ (function () {
                /**
                 * @param {?} element
                 * @param {?} _config
                 * @param {?} _document
                 * @param {?} _ngZone
                 * @param {?} _viewportRuler
                 * @param {?} _dragDropRegistry
                 */
                function DragRef(element, _config, _document, _ngZone, _viewportRuler, _dragDropRegistry) {
                    var _this = this;
                    this._config = _config;
                    this._document = _document;
                    this._ngZone = _ngZone;
                    this._viewportRuler = _viewportRuler;
                    this._dragDropRegistry = _dragDropRegistry;
                    /**
                     * CSS `transform` applied to the element when it isn't being dragged. We need a
                     * passive transform in order for the dragged element to retain its new position
                     * after the user has stopped dragging and because we need to know the relative
                     * position in case they start dragging again. This corresponds to `element.style.transform`.
                     */
                    this._passiveTransform = { x: 0, y: 0 };
                    /**
                     * CSS `transform` that is applied to the element while it's being dragged.
                     */
                    this._activeTransform = { x: 0, y: 0 };
                    /**
                     * Emits when the item is being moved.
                     */
                    this._moveEvents = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Subscription to pointer movement events.
                     */
                    this._pointerMoveSubscription = rxjs__WEBPACK_IMPORTED_MODULE_2__["Subscription"].EMPTY;
                    /**
                     * Subscription to the event that is dispatched when the user lifts their pointer.
                     */
                    this._pointerUpSubscription = rxjs__WEBPACK_IMPORTED_MODULE_2__["Subscription"].EMPTY;
                    /**
                     * Subscription to the viewport being scrolled.
                     */
                    this._scrollSubscription = rxjs__WEBPACK_IMPORTED_MODULE_2__["Subscription"].EMPTY;
                    /**
                     * Subscription to the viewport being resized.
                     */
                    this._resizeSubscription = rxjs__WEBPACK_IMPORTED_MODULE_2__["Subscription"].EMPTY;
                    /**
                     * Cached reference to the boundary element.
                     */
                    this._boundaryElement = null;
                    /**
                     * Whether the native dragging interactions have been enabled on the root element.
                     */
                    this._nativeInteractionsEnabled = true;
                    /**
                     * Elements that can be used to drag the draggable item.
                     */
                    this._handles = [];
                    /**
                     * Registered handles that are currently disabled.
                     */
                    this._disabledHandles = new Set();
                    /**
                     * Layout direction of the item.
                     */
                    this._direction = 'ltr';
                    /**
                     * Amount of milliseconds to wait after the user has put their
                     * pointer down before starting to drag the element.
                     */
                    this.dragStartDelay = 0;
                    this._disabled = false;
                    /**
                     * Emits as the drag sequence is being prepared.
                     */
                    this.beforeStarted = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Emits when the user starts dragging the item.
                     */
                    this.started = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Emits when the user has released a drag item, before any animations have started.
                     */
                    this.released = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Emits when the user stops dragging an item in the container.
                     */
                    this.ended = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Emits when the user has moved the item into a new container.
                     */
                    this.entered = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Emits when the user removes the item its container by dragging it into another container.
                     */
                    this.exited = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Emits when the user drops the item inside a container.
                     */
                    this.dropped = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Emits as the user is dragging the item. Use with caution,
                     * because this event will fire for every pixel that the user has dragged.
                     */
                    this.moved = this._moveEvents.asObservable();
                    /**
                     * Handler for the `mousedown`/`touchstart` events.
                     */
                    this._pointerDown = ( /**
                     * @param {?} event
                     * @return {?}
                     */function (event) {
                        _this.beforeStarted.next();
                        // Delegate the event based on whether it started from a handle or the element itself.
                        if (_this._handles.length) {
                            /** @type {?} */
                            var targetHandle = _this._handles.find(( /**
                             * @param {?} handle
                             * @return {?}
                             */function (/**
                             * @param {?} handle
                             * @return {?}
                             */ handle) {
                                /** @type {?} */
                                var target = event.target;
                                return !!target && (target === handle || handle.contains(( /** @type {?} */(target))));
                            }));
                            if (targetHandle && !_this._disabledHandles.has(targetHandle) && !_this.disabled) {
                                _this._initializeDragSequence(targetHandle, event);
                            }
                        }
                        else if (!_this.disabled) {
                            _this._initializeDragSequence(_this._rootElement, event);
                        }
                    });
                    /**
                     * Handler that is invoked when the user moves their pointer after they've initiated a drag.
                     */
                    this._pointerMove = ( /**
                     * @param {?} event
                     * @return {?}
                     */function (event) {
                        if (!_this._hasStartedDragging) {
                            /** @type {?} */
                            var pointerPosition = _this._getPointerPositionOnPage(event);
                            /** @type {?} */
                            var distanceX = Math.abs(pointerPosition.x - _this._pickupPositionOnPage.x);
                            /** @type {?} */
                            var distanceY = Math.abs(pointerPosition.y - _this._pickupPositionOnPage.y);
                            /** @type {?} */
                            var isOverThreshold = distanceX + distanceY >= _this._config.dragStartThreshold;
                            // Only start dragging after the user has moved more than the minimum distance in either
                            // direction. Note that this is preferrable over doing something like `skip(minimumDistance)`
                            // in the `pointerMove` subscription, because we're not guaranteed to have one move event
                            // per pixel of movement (e.g. if the user moves their pointer quickly).
                            if (isOverThreshold) {
                                /** @type {?} */
                                var isDelayElapsed = Date.now() >= _this._dragStartTime + (_this.dragStartDelay || 0);
                                if (!isDelayElapsed) {
                                    _this._endDragSequence(event);
                                    return;
                                }
                                // Prevent other drag sequences from starting while something in the container is still
                                // being dragged. This can happen while we're waiting for the drop animation to finish
                                // and can cause errors, because some elements might still be moving around.
                                if (!_this._dropContainer || !_this._dropContainer.isDragging()) {
                                    _this._hasStartedDragging = true;
                                    _this._ngZone.run(( /**
                                     * @return {?}
                                     */function () { return _this._startDragSequence(event); }));
                                }
                            }
                            return;
                        }
                        // We only need the preview dimensions if we have a boundary element.
                        if (_this._boundaryElement) {
                            // Cache the preview element rect if we haven't cached it already or if
                            // we cached it too early before the element dimensions were computed.
                            if (!_this._previewRect || (!_this._previewRect.width && !_this._previewRect.height)) {
                                _this._previewRect = (_this._preview || _this._rootElement).getBoundingClientRect();
                            }
                        }
                        /** @type {?} */
                        var constrainedPointerPosition = _this._getConstrainedPointerPosition(event);
                        _this._hasMoved = true;
                        event.preventDefault();
                        _this._updatePointerDirectionDelta(constrainedPointerPosition);
                        if (_this._dropContainer) {
                            _this._updateActiveDropContainer(constrainedPointerPosition);
                        }
                        else {
                            /** @type {?} */
                            var activeTransform = _this._activeTransform;
                            activeTransform.x =
                                constrainedPointerPosition.x - _this._pickupPositionOnPage.x + _this._passiveTransform.x;
                            activeTransform.y =
                                constrainedPointerPosition.y - _this._pickupPositionOnPage.y + _this._passiveTransform.y;
                            _this._applyRootElementTransform(activeTransform.x, activeTransform.y);
                            // Apply transform as attribute if dragging and svg element to work for IE
                            if (typeof SVGElement !== 'undefined' && _this._rootElement instanceof SVGElement) {
                                /** @type {?} */
                                var appliedTransform = "translate(" + activeTransform.x + " " + activeTransform.y + ")";
                                _this._rootElement.setAttribute('transform', appliedTransform);
                            }
                        }
                        // Since this event gets fired for every pixel while dragging, we only
                        // want to fire it if the consumer opted into it. Also we have to
                        // re-enter the zone because we run all of the events on the outside.
                        if (_this._moveEvents.observers.length) {
                            _this._ngZone.run(( /**
                             * @return {?}
                             */function () {
                                _this._moveEvents.next({
                                    source: _this,
                                    pointerPosition: constrainedPointerPosition,
                                    event: event,
                                    distance: _this._getDragDistance(constrainedPointerPosition),
                                    delta: _this._pointerDirectionDelta
                                });
                            }));
                        }
                    });
                    /**
                     * Handler that is invoked when the user lifts their pointer up, after initiating a drag.
                     */
                    this._pointerUp = ( /**
                     * @param {?} event
                     * @return {?}
                     */function (event) {
                        _this._endDragSequence(event);
                    });
                    this.withRootElement(element);
                    _dragDropRegistry.registerDragItem(this);
                }
                Object.defineProperty(DragRef.prototype, "disabled", {
                    /**
                     * Whether starting to drag this element is disabled.
                     * @return {?}
                     */
                    get: function () {
                        return this._disabled || !!(this._dropContainer && this._dropContainer.disabled);
                    },
                    /**
                     * @param {?} value
                     * @return {?}
                     */
                    set: function (value) {
                        /** @type {?} */
                        var newValue = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceBooleanProperty"])(value);
                        if (newValue !== this._disabled) {
                            this._disabled = newValue;
                            this._toggleNativeDragInteractions();
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Returns the element that is being used as a placeholder
                 * while the current element is being dragged.
                 * @return {?}
                 */
                DragRef.prototype.getPlaceholderElement = function () {
                    return this._placeholder;
                };
                /**
                 * Returns the root draggable element.
                 * @return {?}
                 */
                DragRef.prototype.getRootElement = function () {
                    return this._rootElement;
                };
                /**
                 * Registers the handles that can be used to drag the element.
                 * @template THIS
                 * @this {THIS}
                 * @param {?} handles
                 * @return {THIS}
                 */
                DragRef.prototype.withHandles = function (handles) {
                    ( /** @type {?} */(this))._handles = handles.map(( /**
                     * @param {?} handle
                     * @return {?}
                     */function (/**
                     * @param {?} handle
                     * @return {?}
                     */ handle) { return Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceElement"])(handle); }));
                    ( /** @type {?} */(this))._handles.forEach(( /**
                     * @param {?} handle
                     * @return {?}
                     */function (/**
                     * @param {?} handle
                     * @return {?}
                     */ handle) { return toggleNativeDragInteractions(handle, false); }));
                    ( /** @type {?} */(this))._toggleNativeDragInteractions();
                    return ( /** @type {?} */(this));
                };
                /**
                 * Registers the template that should be used for the drag preview.
                 * @template THIS
                 * @this {THIS}
                 * @param {?} template Template that from which to stamp out the preview.
                 * @return {THIS}
                 */
                DragRef.prototype.withPreviewTemplate = function (template) {
                    ( /** @type {?} */(this))._previewTemplate = template;
                    return ( /** @type {?} */(this));
                };
                /**
                 * Registers the template that should be used for the drag placeholder.
                 * @template THIS
                 * @this {THIS}
                 * @param {?} template Template that from which to stamp out the placeholder.
                 * @return {THIS}
                 */
                DragRef.prototype.withPlaceholderTemplate = function (template) {
                    ( /** @type {?} */(this))._placeholderTemplate = template;
                    return ( /** @type {?} */(this));
                };
                /**
                 * Sets an alternate drag root element. The root element is the element that will be moved as
                 * the user is dragging. Passing an alternate root element is useful when trying to enable
                 * dragging on an element that you might not have access to.
                 * @template THIS
                 * @this {THIS}
                 * @param {?} rootElement
                 * @return {THIS}
                 */
                DragRef.prototype.withRootElement = function (rootElement) {
                    /** @type {?} */
                    var element = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceElement"])(rootElement);
                    if (element !== ( /** @type {?} */(this))._rootElement) {
                        if (( /** @type {?} */(this))._rootElement) {
                            ( /** @type {?} */(this))._removeRootElementListeners(( /** @type {?} */(this))._rootElement);
                        }
                        element.addEventListener('mousedown', ( /** @type {?} */(this))._pointerDown, activeEventListenerOptions);
                        element.addEventListener('touchstart', ( /** @type {?} */(this))._pointerDown, passiveEventListenerOptions);
                        ( /** @type {?} */(this))._initialTransform = undefined;
                        ( /** @type {?} */(this))._rootElement = element;
                    }
                    return ( /** @type {?} */(this));
                };
                /**
                 * Element to which the draggable's position will be constrained.
                 * @template THIS
                 * @this {THIS}
                 * @param {?} boundaryElement
                 * @return {THIS}
                 */
                DragRef.prototype.withBoundaryElement = function (boundaryElement) {
                    var _this = this;
                    ( /** @type {?} */(this))._boundaryElement = boundaryElement ? Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceElement"])(boundaryElement) : null;
                    ( /** @type {?} */(this))._resizeSubscription.unsubscribe();
                    if (boundaryElement) {
                        ( /** @type {?} */(this))._resizeSubscription = ( /** @type {?} */(this))._viewportRuler
                            .change(10)
                            .subscribe(( /**
                     * @return {?}
                     */function () { return ( /** @type {?} */(_this))._containInsideBoundaryOnResize(); }));
                    }
                    return ( /** @type {?} */(this));
                };
                /**
                 * Removes the dragging functionality from the DOM element.
                 * @return {?}
                 */
                DragRef.prototype.dispose = function () {
                    this._removeRootElementListeners(this._rootElement);
                    // Do this check before removing from the registry since it'll
                    // stop being considered as dragged once it is removed.
                    if (this.isDragging()) {
                        // Since we move out the element to the end of the body while it's being
                        // dragged, we have to make sure that it's removed if it gets destroyed.
                        removeElement(this._rootElement);
                    }
                    this._destroyPreview();
                    this._destroyPlaceholder();
                    this._dragDropRegistry.removeDragItem(this);
                    this._removeSubscriptions();
                    this.beforeStarted.complete();
                    this.started.complete();
                    this.released.complete();
                    this.ended.complete();
                    this.entered.complete();
                    this.exited.complete();
                    this.dropped.complete();
                    this._moveEvents.complete();
                    this._handles = [];
                    this._disabledHandles.clear();
                    this._dropContainer = undefined;
                    this._boundaryElement = this._rootElement = this._placeholderTemplate =
                        this._previewTemplate = this._nextSibling = ( /** @type {?} */(null));
                };
                /**
                 * Checks whether the element is currently being dragged.
                 * @return {?}
                 */
                DragRef.prototype.isDragging = function () {
                    return this._hasStartedDragging && this._dragDropRegistry.isDragging(this);
                };
                /**
                 * Resets a standalone drag item to its initial position.
                 * @return {?}
                 */
                DragRef.prototype.reset = function () {
                    this._rootElement.style.transform = this._initialTransform || '';
                    this._activeTransform = { x: 0, y: 0 };
                    this._passiveTransform = { x: 0, y: 0 };
                };
                /**
                 * Sets a handle as disabled. While a handle is disabled, it'll capture and interrupt dragging.
                 * @param {?} handle Handle element that should be disabled.
                 * @return {?}
                 */
                DragRef.prototype.disableHandle = function (handle) {
                    if (this._handles.indexOf(handle) > -1) {
                        this._disabledHandles.add(handle);
                    }
                };
                /**
                 * Enables a handle, if it has been disabled.
                 * @param {?} handle Handle element to be enabled.
                 * @return {?}
                 */
                DragRef.prototype.enableHandle = function (handle) {
                    this._disabledHandles.delete(handle);
                };
                /**
                 * Sets the layout direction of the draggable item.
                 * @template THIS
                 * @this {THIS}
                 * @param {?} direction
                 * @return {THIS}
                 */
                DragRef.prototype.withDirection = function (direction) {
                    ( /** @type {?} */(this))._direction = direction;
                    return ( /** @type {?} */(this));
                };
                /**
                 * Sets the container that the item is part of.
                 * @param {?} container
                 * @return {?}
                 */
                DragRef.prototype._withDropContainer = function (container) {
                    this._dropContainer = container;
                };
                /**
                 * Gets the current position in pixels the draggable outside of a drop container.
                 * @return {?}
                 */
                DragRef.prototype.getFreeDragPosition = function () {
                    /** @type {?} */
                    var position = this.isDragging() ? this._activeTransform : this._passiveTransform;
                    return { x: position.x, y: position.y };
                };
                /**
                 * Sets the current position in pixels the draggable outside of a drop container.
                 * @template THIS
                 * @this {THIS}
                 * @param {?} value New position to be set.
                 * @return {THIS}
                 */
                DragRef.prototype.setFreeDragPosition = function (value) {
                    ( /** @type {?} */(this))._activeTransform = { x: 0, y: 0 };
                    ( /** @type {?} */(this))._passiveTransform.x = value.x;
                    ( /** @type {?} */(this))._passiveTransform.y = value.y;
                    if (!( /** @type {?} */(this))._dropContainer) {
                        ( /** @type {?} */(this))._applyRootElementTransform(value.x, value.y);
                    }
                    return ( /** @type {?} */(this));
                };
                /**
                 * Updates the item's sort order based on the last-known pointer position.
                 * @return {?}
                 */
                DragRef.prototype._sortFromLastPointerPosition = function () {
                    /** @type {?} */
                    var position = this._pointerPositionAtLastDirectionChange;
                    if (position && this._dropContainer) {
                        this._updateActiveDropContainer(position);
                    }
                };
                /**
                 * Unsubscribes from the global subscriptions.
                 * @private
                 * @return {?}
                 */
                DragRef.prototype._removeSubscriptions = function () {
                    this._pointerMoveSubscription.unsubscribe();
                    this._pointerUpSubscription.unsubscribe();
                    this._scrollSubscription.unsubscribe();
                };
                /**
                 * Destroys the preview element and its ViewRef.
                 * @private
                 * @return {?}
                 */
                DragRef.prototype._destroyPreview = function () {
                    if (this._preview) {
                        removeElement(this._preview);
                    }
                    if (this._previewRef) {
                        this._previewRef.destroy();
                    }
                    this._preview = this._previewRef = ( /** @type {?} */(null));
                };
                /**
                 * Destroys the placeholder element and its ViewRef.
                 * @private
                 * @return {?}
                 */
                DragRef.prototype._destroyPlaceholder = function () {
                    if (this._placeholder) {
                        removeElement(this._placeholder);
                    }
                    if (this._placeholderRef) {
                        this._placeholderRef.destroy();
                    }
                    this._placeholder = this._placeholderRef = ( /** @type {?} */(null));
                };
                /**
                 * Clears subscriptions and stops the dragging sequence.
                 * @private
                 * @param {?} event Browser event object that ended the sequence.
                 * @return {?}
                 */
                DragRef.prototype._endDragSequence = function (event) {
                    var _this = this;
                    // Note that here we use `isDragging` from the service, rather than from `this`.
                    // The difference is that the one from the service reflects whether a dragging sequence
                    // has been initiated, whereas the one on `this` includes whether the user has passed
                    // the minimum dragging threshold.
                    if (!this._dragDropRegistry.isDragging(this)) {
                        return;
                    }
                    this._removeSubscriptions();
                    this._dragDropRegistry.stopDragging(this);
                    this._toggleNativeDragInteractions();
                    if (this._handles) {
                        this._rootElement.style.webkitTapHighlightColor = this._rootElementTapHighlight;
                    }
                    if (!this._hasStartedDragging) {
                        return;
                    }
                    this.released.next({ source: this });
                    if (this._dropContainer) {
                        // Stop scrolling immediately, instead of waiting for the animation to finish.
                        this._dropContainer._stopScrolling();
                        this._animatePreviewToPlaceholder().then(( /**
                         * @return {?}
                         */function () {
                            _this._cleanupDragArtifacts(event);
                            _this._cleanupCachedDimensions();
                            _this._dragDropRegistry.stopDragging(_this);
                        }));
                    }
                    else {
                        // Convert the active transform into a passive one. This means that next time
                        // the user starts dragging the item, its position will be calculated relatively
                        // to the new passive transform.
                        this._passiveTransform.x = this._activeTransform.x;
                        this._passiveTransform.y = this._activeTransform.y;
                        this._ngZone.run(( /**
                         * @return {?}
                         */function () {
                            _this.ended.next({
                                source: _this,
                                distance: _this._getDragDistance(_this._getPointerPositionOnPage(event))
                            });
                        }));
                        this._cleanupCachedDimensions();
                        this._dragDropRegistry.stopDragging(this);
                    }
                };
                /**
                 * Starts the dragging sequence.
                 * @private
                 * @param {?} event
                 * @return {?}
                 */
                DragRef.prototype._startDragSequence = function (event) {
                    // Emit the event on the item before the one on the container.
                    this.started.next({ source: this });
                    if (isTouchEvent(event)) {
                        this._lastTouchEventTime = Date.now();
                    }
                    this._toggleNativeDragInteractions();
                    if (this._dropContainer) {
                        /** @type {?} */
                        var element = this._rootElement;
                        // Grab the `nextSibling` before the preview and placeholder
                        // have been created so we don't get the preview by accident.
                        this._nextSibling = element.nextSibling;
                        /** @type {?} */
                        var preview = this._preview = this._createPreviewElement();
                        /** @type {?} */
                        var placeholder = this._placeholder = this._createPlaceholderElement();
                        // We move the element out at the end of the body and we make it hidden, because keeping it in
                        // place will throw off the consumer's `:last-child` selectors. We can't remove the element
                        // from the DOM completely, because iOS will stop firing all subsequent events in the chain.
                        element.style.display = 'none';
                        this._document.body.appendChild(( /** @type {?} */(element.parentNode)).replaceChild(placeholder, element));
                        getPreviewInsertionPoint(this._document).appendChild(preview);
                        this._dropContainer.start();
                    }
                };
                /**
                 * Sets up the different variables and subscriptions
                 * that will be necessary for the dragging sequence.
                 * @private
                 * @param {?} referenceElement Element that started the drag sequence.
                 * @param {?} event Browser event object that started the sequence.
                 * @return {?}
                 */
                DragRef.prototype._initializeDragSequence = function (referenceElement, event) {
                    var _this = this;
                    // Always stop propagation for the event that initializes
                    // the dragging sequence, in order to prevent it from potentially
                    // starting another sequence for a draggable parent somewhere up the DOM tree.
                    event.stopPropagation();
                    /** @type {?} */
                    var isDragging = this.isDragging();
                    /** @type {?} */
                    var isTouchSequence = isTouchEvent(event);
                    /** @type {?} */
                    var isAuxiliaryMouseButton = !isTouchSequence && (( /** @type {?} */(event))).button !== 0;
                    /** @type {?} */
                    var rootElement = this._rootElement;
                    /** @type {?} */
                    var isSyntheticEvent = !isTouchSequence && this._lastTouchEventTime &&
                        this._lastTouchEventTime + MOUSE_EVENT_IGNORE_TIME > Date.now();
                    // If the event started from an element with the native HTML drag&drop, it'll interfere
                    // with our own dragging (e.g. `img` tags do it by default). Prevent the default action
                    // to stop it from happening. Note that preventing on `dragstart` also seems to work, but
                    // it's flaky and it fails if the user drags it away quickly. Also note that we only want
                    // to do this for `mousedown` since doing the same for `touchstart` will stop any `click`
                    // events from firing on touch devices.
                    if (event.target && (( /** @type {?} */(event.target))).draggable && event.type === 'mousedown') {
                        event.preventDefault();
                    }
                    // Abort if the user is already dragging or is using a mouse button other than the primary one.
                    if (isDragging || isAuxiliaryMouseButton || isSyntheticEvent) {
                        return;
                    }
                    // If we've got handles, we need to disable the tap highlight on the entire root element,
                    // otherwise iOS will still add it, even though all the drag interactions on the handle
                    // are disabled.
                    if (this._handles.length) {
                        this._rootElementTapHighlight = rootElement.style.webkitTapHighlightColor;
                        rootElement.style.webkitTapHighlightColor = 'transparent';
                    }
                    this._hasStartedDragging = this._hasMoved = false;
                    this._initialContainer = ( /** @type {?} */(this._dropContainer));
                    // Avoid multiple subscriptions and memory leaks when multi touch
                    // (isDragging check above isn't enough because of possible temporal and/or dimensional delays)
                    this._removeSubscriptions();
                    this._pointerMoveSubscription = this._dragDropRegistry.pointerMove.subscribe(this._pointerMove);
                    this._pointerUpSubscription = this._dragDropRegistry.pointerUp.subscribe(this._pointerUp);
                    this._scrollSubscription = this._dragDropRegistry.scroll.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["startWith"])(null)).subscribe(( /**
                     * @return {?}
                     */function () {
                        _this._scrollPosition = _this._viewportRuler.getViewportScrollPosition();
                    }));
                    if (this._boundaryElement) {
                        this._boundaryRect = this._boundaryElement.getBoundingClientRect();
                    }
                    // If we have a custom preview template, the element won't be visible anyway so we avoid the
                    // extra `getBoundingClientRect` calls and just move the preview next to the cursor.
                    this._pickupPositionInElement = this._previewTemplate && this._previewTemplate.template ?
                        { x: 0, y: 0 } :
                        this._getPointerPositionInElement(referenceElement, event);
                    /** @type {?} */
                    var pointerPosition = this._pickupPositionOnPage = this._getPointerPositionOnPage(event);
                    this._pointerDirectionDelta = { x: 0, y: 0 };
                    this._pointerPositionAtLastDirectionChange = { x: pointerPosition.x, y: pointerPosition.y };
                    this._dragStartTime = Date.now();
                    this._dragDropRegistry.startDragging(this, event);
                };
                /**
                 * Cleans up the DOM artifacts that were added to facilitate the element being dragged.
                 * @private
                 * @param {?} event
                 * @return {?}
                 */
                DragRef.prototype._cleanupDragArtifacts = function (event) {
                    var _this = this;
                    // Restore the element's visibility and insert it at its old position in the DOM.
                    // It's important that we maintain the position, because moving the element around in the DOM
                    // can throw off `NgFor` which does smart diffing and re-creates elements only when necessary,
                    // while moving the existing elements in all other cases.
                    this._rootElement.style.display = '';
                    if (this._nextSibling) {
                        ( /** @type {?} */(this._nextSibling.parentNode)).insertBefore(this._rootElement, this._nextSibling);
                    }
                    else {
                        Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceElement"])(this._initialContainer.element).appendChild(this._rootElement);
                    }
                    this._destroyPreview();
                    this._destroyPlaceholder();
                    this._boundaryRect = this._previewRect = undefined;
                    // Re-enter the NgZone since we bound `document` events on the outside.
                    this._ngZone.run(( /**
                     * @return {?}
                     */function () {
                        /** @type {?} */
                        var container = ( /** @type {?} */(_this._dropContainer));
                        /** @type {?} */
                        var currentIndex = container.getItemIndex(_this);
                        /** @type {?} */
                        var pointerPosition = _this._getPointerPositionOnPage(event);
                        /** @type {?} */
                        var distance = _this._getDragDistance(_this._getPointerPositionOnPage(event));
                        /** @type {?} */
                        var isPointerOverContainer = container._isOverContainer(pointerPosition.x, pointerPosition.y);
                        _this.ended.next({ source: _this, distance: distance });
                        _this.dropped.next({
                            item: _this,
                            currentIndex: currentIndex,
                            previousIndex: _this._initialContainer.getItemIndex(_this),
                            container: container,
                            previousContainer: _this._initialContainer,
                            isPointerOverContainer: isPointerOverContainer,
                            distance: distance
                        });
                        container.drop(_this, currentIndex, _this._initialContainer, isPointerOverContainer, distance);
                        _this._dropContainer = _this._initialContainer;
                    }));
                };
                /**
                 * Updates the item's position in its drop container, or moves it
                 * into a new one, depending on its current drag position.
                 * @private
                 * @param {?} __0
                 * @return {?}
                 */
                DragRef.prototype._updateActiveDropContainer = function (_a) {
                    var _this = this;
                    var x = _a.x, y = _a.y;
                    // Drop container that draggable has been moved into.
                    /** @type {?} */
                    var newContainer = this._initialContainer._getSiblingContainerFromPosition(this, x, y);
                    // If we couldn't find a new container to move the item into, and the item has left its
                    // initial container, check whether the it's over the initial container. This handles the
                    // case where two containers are connected one way and the user tries to undo dragging an
                    // item into a new container.
                    if (!newContainer && this._dropContainer !== this._initialContainer &&
                        this._initialContainer._isOverContainer(x, y)) {
                        newContainer = this._initialContainer;
                    }
                    if (newContainer && newContainer !== this._dropContainer) {
                        this._ngZone.run(( /**
                         * @return {?}
                         */function () {
                            // Notify the old container that the item has left.
                            _this.exited.next({ item: _this, container: ( /** @type {?} */(_this._dropContainer)) });
                            ( /** @type {?} */(_this._dropContainer)).exit(_this);
                            // Notify the new container that the item has entered.
                            _this._dropContainer = ( /** @type {?} */(newContainer));
                            _this._dropContainer.enter(_this, x, y);
                            _this.entered.next({
                                item: _this,
                                container: ( /** @type {?} */(newContainer)),
                                currentIndex: ( /** @type {?} */(newContainer)).getItemIndex(_this)
                            });
                        }));
                    }
                    ( /** @type {?} */(this._dropContainer))._startScrollingIfNecessary(x, y);
                    ( /** @type {?} */(this._dropContainer))._sortItem(this, x, y, this._pointerDirectionDelta);
                    this._preview.style.transform =
                        getTransform(x - this._pickupPositionInElement.x, y - this._pickupPositionInElement.y);
                };
                /**
                 * Creates the element that will be rendered next to the user's pointer
                 * and will be used as a preview of the element that is being dragged.
                 * @private
                 * @return {?}
                 */
                DragRef.prototype._createPreviewElement = function () {
                    /** @type {?} */
                    var previewConfig = this._previewTemplate;
                    /** @type {?} */
                    var previewTemplate = previewConfig ? previewConfig.template : null;
                    /** @type {?} */
                    var preview;
                    if (previewTemplate) {
                        /** @type {?} */
                        var viewRef = ( /** @type {?} */(previewConfig)).viewContainer.createEmbeddedView(previewTemplate, ( /** @type {?} */(previewConfig)).context);
                        preview = getRootNode(viewRef, this._document);
                        this._previewRef = viewRef;
                        preview.style.transform =
                            getTransform(this._pickupPositionOnPage.x, this._pickupPositionOnPage.y);
                    }
                    else {
                        /** @type {?} */
                        var element = this._rootElement;
                        /** @type {?} */
                        var elementRect = element.getBoundingClientRect();
                        preview = deepCloneNode(element);
                        preview.style.width = elementRect.width + "px";
                        preview.style.height = elementRect.height + "px";
                        preview.style.transform = getTransform(elementRect.left, elementRect.top);
                    }
                    extendStyles(preview.style, {
                        // It's important that we disable the pointer events on the preview, because
                        // it can throw off the `document.elementFromPoint` calls in the `CdkDropList`.
                        pointerEvents: 'none',
                        // We have to reset the margin, because can throw off positioning relative to the viewport.
                        margin: '0',
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        zIndex: '1000'
                    });
                    toggleNativeDragInteractions(preview, false);
                    preview.classList.add('cdk-drag-preview');
                    preview.setAttribute('dir', this._direction);
                    return preview;
                };
                /**
                 * Animates the preview element from its current position to the location of the drop placeholder.
                 * @private
                 * @return {?} Promise that resolves when the animation completes.
                 */
                DragRef.prototype._animatePreviewToPlaceholder = function () {
                    var _this = this;
                    // If the user hasn't moved yet, the transitionend event won't fire.
                    if (!this._hasMoved) {
                        return Promise.resolve();
                    }
                    /** @type {?} */
                    var placeholderRect = this._placeholder.getBoundingClientRect();
                    // Apply the class that adds a transition to the preview.
                    this._preview.classList.add('cdk-drag-animating');
                    // Move the preview to the placeholder position.
                    this._preview.style.transform = getTransform(placeholderRect.left, placeholderRect.top);
                    // If the element doesn't have a `transition`, the `transitionend` event won't fire. Since
                    // we need to trigger a style recalculation in order for the `cdk-drag-animating` class to
                    // apply its style, we take advantage of the available info to figure out whether we need to
                    // bind the event in the first place.
                    /** @type {?} */
                    var duration = getTransformTransitionDurationInMs(this._preview);
                    if (duration === 0) {
                        return Promise.resolve();
                    }
                    return this._ngZone.runOutsideAngular(( /**
                     * @return {?}
                     */function () {
                        return new Promise(( /**
                         * @param {?} resolve
                         * @return {?}
                         */function (/**
                         * @param {?} resolve
                         * @return {?}
                         */ resolve) {
                            /** @type {?} */
                            var handler = ( /** @type {?} */((( /**
                             * @param {?} event
                             * @return {?}
                             */function (event) {
                                if (!event || (event.target === _this._preview && event.propertyName === 'transform')) {
                                    _this._preview.removeEventListener('transitionend', handler);
                                    resolve();
                                    clearTimeout(timeout);
                                }
                            }))));
                            // If a transition is short enough, the browser might not fire the `transitionend` event.
                            // Since we know how long it's supposed to take, add a timeout with a 50% buffer that'll
                            // fire if the transition hasn't completed when it was supposed to.
                            /** @type {?} */
                            var timeout = setTimeout(( /** @type {?} */(handler)), duration * 1.5);
                            _this._preview.addEventListener('transitionend', handler);
                        }));
                    }));
                };
                /**
                 * Creates an element that will be shown instead of the current element while dragging.
                 * @private
                 * @return {?}
                 */
                DragRef.prototype._createPlaceholderElement = function () {
                    /** @type {?} */
                    var placeholderConfig = this._placeholderTemplate;
                    /** @type {?} */
                    var placeholderTemplate = placeholderConfig ? placeholderConfig.template : null;
                    /** @type {?} */
                    var placeholder;
                    if (placeholderTemplate) {
                        this._placeholderRef = ( /** @type {?} */(placeholderConfig)).viewContainer.createEmbeddedView(placeholderTemplate, ( /** @type {?} */(placeholderConfig)).context);
                        placeholder = getRootNode(this._placeholderRef, this._document);
                    }
                    else {
                        placeholder = deepCloneNode(this._rootElement);
                    }
                    placeholder.classList.add('cdk-drag-placeholder');
                    return placeholder;
                };
                /**
                 * Figures out the coordinates at which an element was picked up.
                 * @private
                 * @param {?} referenceElement Element that initiated the dragging.
                 * @param {?} event Event that initiated the dragging.
                 * @return {?}
                 */
                DragRef.prototype._getPointerPositionInElement = function (referenceElement, event) {
                    /** @type {?} */
                    var elementRect = this._rootElement.getBoundingClientRect();
                    /** @type {?} */
                    var handleElement = referenceElement === this._rootElement ? null : referenceElement;
                    /** @type {?} */
                    var referenceRect = handleElement ? handleElement.getBoundingClientRect() : elementRect;
                    /** @type {?} */
                    var point = isTouchEvent(event) ? event.targetTouches[0] : event;
                    /** @type {?} */
                    var x = point.pageX - referenceRect.left - this._scrollPosition.left;
                    /** @type {?} */
                    var y = point.pageY - referenceRect.top - this._scrollPosition.top;
                    return {
                        x: referenceRect.left - elementRect.left + x,
                        y: referenceRect.top - elementRect.top + y
                    };
                };
                /**
                 * Determines the point of the page that was touched by the user.
                 * @private
                 * @param {?} event
                 * @return {?}
                 */
                DragRef.prototype._getPointerPositionOnPage = function (event) {
                    // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
                    /** @type {?} */
                    var point = isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
                    return {
                        x: point.pageX - this._scrollPosition.left,
                        y: point.pageY - this._scrollPosition.top
                    };
                };
                /**
                 * Gets the pointer position on the page, accounting for any position constraints.
                 * @private
                 * @param {?} event
                 * @return {?}
                 */
                DragRef.prototype._getConstrainedPointerPosition = function (event) {
                    /** @type {?} */
                    var point = this._getPointerPositionOnPage(event);
                    /** @type {?} */
                    var constrainedPoint = this.constrainPosition ? this.constrainPosition(point, this) : point;
                    /** @type {?} */
                    var dropContainerLock = this._dropContainer ? this._dropContainer.lockAxis : null;
                    if (this.lockAxis === 'x' || dropContainerLock === 'x') {
                        constrainedPoint.y = this._pickupPositionOnPage.y;
                    }
                    else if (this.lockAxis === 'y' || dropContainerLock === 'y') {
                        constrainedPoint.x = this._pickupPositionOnPage.x;
                    }
                    if (this._boundaryRect) {
                        var _a = this._pickupPositionInElement, pickupX = _a.x, pickupY = _a.y;
                        /** @type {?} */
                        var boundaryRect = this._boundaryRect;
                        /** @type {?} */
                        var previewRect = ( /** @type {?} */(this._previewRect));
                        /** @type {?} */
                        var minY = boundaryRect.top + pickupY;
                        /** @type {?} */
                        var maxY = boundaryRect.bottom - (previewRect.height - pickupY);
                        /** @type {?} */
                        var minX = boundaryRect.left + pickupX;
                        /** @type {?} */
                        var maxX = boundaryRect.right - (previewRect.width - pickupX);
                        constrainedPoint.x = clamp(constrainedPoint.x, minX, maxX);
                        constrainedPoint.y = clamp(constrainedPoint.y, minY, maxY);
                    }
                    return constrainedPoint;
                };
                /**
                 * Updates the current drag delta, based on the user's current pointer position on the page.
                 * @private
                 * @param {?} pointerPositionOnPage
                 * @return {?}
                 */
                DragRef.prototype._updatePointerDirectionDelta = function (pointerPositionOnPage) {
                    var x = pointerPositionOnPage.x, y = pointerPositionOnPage.y;
                    /** @type {?} */
                    var delta = this._pointerDirectionDelta;
                    /** @type {?} */
                    var positionSinceLastChange = this._pointerPositionAtLastDirectionChange;
                    // Amount of pixels the user has dragged since the last time the direction changed.
                    /** @type {?} */
                    var changeX = Math.abs(x - positionSinceLastChange.x);
                    /** @type {?} */
                    var changeY = Math.abs(y - positionSinceLastChange.y);
                    // Because we handle pointer events on a per-pixel basis, we don't want the delta
                    // to change for every pixel, otherwise anything that depends on it can look erratic.
                    // To make the delta more consistent, we track how much the user has moved since the last
                    // delta change and we only update it after it has reached a certain threshold.
                    if (changeX > this._config.pointerDirectionChangeThreshold) {
                        delta.x = x > positionSinceLastChange.x ? 1 : -1;
                        positionSinceLastChange.x = x;
                    }
                    if (changeY > this._config.pointerDirectionChangeThreshold) {
                        delta.y = y > positionSinceLastChange.y ? 1 : -1;
                        positionSinceLastChange.y = y;
                    }
                    return delta;
                };
                /**
                 * Toggles the native drag interactions, based on how many handles are registered.
                 * @private
                 * @return {?}
                 */
                DragRef.prototype._toggleNativeDragInteractions = function () {
                    if (!this._rootElement || !this._handles) {
                        return;
                    }
                    /** @type {?} */
                    var shouldEnable = this._handles.length > 0 || !this.isDragging();
                    if (shouldEnable !== this._nativeInteractionsEnabled) {
                        this._nativeInteractionsEnabled = shouldEnable;
                        toggleNativeDragInteractions(this._rootElement, shouldEnable);
                    }
                };
                /**
                 * Removes the manually-added event listeners from the root element.
                 * @private
                 * @param {?} element
                 * @return {?}
                 */
                DragRef.prototype._removeRootElementListeners = function (element) {
                    element.removeEventListener('mousedown', this._pointerDown, activeEventListenerOptions);
                    element.removeEventListener('touchstart', this._pointerDown, passiveEventListenerOptions);
                };
                /**
                 * Applies a `transform` to the root element, taking into account any existing transforms on it.
                 * @private
                 * @param {?} x New transform value along the X axis.
                 * @param {?} y New transform value along the Y axis.
                 * @return {?}
                 */
                DragRef.prototype._applyRootElementTransform = function (x, y) {
                    /** @type {?} */
                    var transform = getTransform(x, y);
                    // Cache the previous transform amount only after the first drag sequence, because
                    // we don't want our own transforms to stack on top of each other.
                    if (this._initialTransform == null) {
                        this._initialTransform = this._rootElement.style.transform || '';
                    }
                    // Preserve the previous `transform` value, if there was one. Note that we apply our own
                    // transform before the user's, because things like rotation can affect which direction
                    // the element will be translated towards.
                    this._rootElement.style.transform = this._initialTransform ?
                        transform + ' ' + this._initialTransform : transform;
                };
                /**
                 * Gets the distance that the user has dragged during the current drag sequence.
                 * @private
                 * @param {?} currentPosition Current position of the user's pointer.
                 * @return {?}
                 */
                DragRef.prototype._getDragDistance = function (currentPosition) {
                    /** @type {?} */
                    var pickupPosition = this._pickupPositionOnPage;
                    if (pickupPosition) {
                        return { x: currentPosition.x - pickupPosition.x, y: currentPosition.y - pickupPosition.y };
                    }
                    return { x: 0, y: 0 };
                };
                /**
                 * Cleans up any cached element dimensions that we don't need after dragging has stopped.
                 * @private
                 * @return {?}
                 */
                DragRef.prototype._cleanupCachedDimensions = function () {
                    this._boundaryRect = this._previewRect = undefined;
                };
                /**
                 * Checks whether the element is still inside its boundary after the viewport has been resized.
                 * If not, the position is adjusted so that the element fits again.
                 * @private
                 * @return {?}
                 */
                DragRef.prototype._containInsideBoundaryOnResize = function () {
                    var _a = this._passiveTransform, x = _a.x, y = _a.y;
                    if ((x === 0 && y === 0) || this.isDragging() || !this._boundaryElement) {
                        return;
                    }
                    /** @type {?} */
                    var boundaryRect = this._boundaryElement.getBoundingClientRect();
                    /** @type {?} */
                    var elementRect = this._rootElement.getBoundingClientRect();
                    /** @type {?} */
                    var leftOverflow = boundaryRect.left - elementRect.left;
                    /** @type {?} */
                    var rightOverflow = elementRect.right - boundaryRect.right;
                    /** @type {?} */
                    var topOverflow = boundaryRect.top - elementRect.top;
                    /** @type {?} */
                    var bottomOverflow = elementRect.bottom - boundaryRect.bottom;
                    // If the element has become wider than the boundary, we can't
                    // do much to make it fit so we just anchor it to the left.
                    if (boundaryRect.width > elementRect.width) {
                        if (leftOverflow > 0) {
                            x += leftOverflow;
                        }
                        if (rightOverflow > 0) {
                            x -= rightOverflow;
                        }
                    }
                    else {
                        x = 0;
                    }
                    // If the element has become taller than the boundary, we can't
                    // do much to make it fit so we just anchor it to the top.
                    if (boundaryRect.height > elementRect.height) {
                        if (topOverflow > 0) {
                            y += topOverflow;
                        }
                        if (bottomOverflow > 0) {
                            y -= bottomOverflow;
                        }
                    }
                    else {
                        y = 0;
                    }
                    if (x !== this._passiveTransform.x || y !== this._passiveTransform.y) {
                        this.setFreeDragPosition({ y: y, x: x });
                    }
                };
                return DragRef;
            }());
            /**
             * Gets a 3d `transform` that can be applied to an element.
             * @param {?} x Desired position of the element along the X axis.
             * @param {?} y Desired position of the element along the Y axis.
             * @return {?}
             */
            function getTransform(x, y) {
                // Round the transforms since some browsers will
                // blur the elements for sub-pixel transforms.
                return "translate3d(" + Math.round(x) + "px, " + Math.round(y) + "px, 0)";
            }
            /**
             * Creates a deep clone of an element.
             * @param {?} node
             * @return {?}
             */
            function deepCloneNode(node) {
                /** @type {?} */
                var clone = ( /** @type {?} */(node.cloneNode(true)));
                /** @type {?} */
                var descendantsWithId = clone.querySelectorAll('[id]');
                /** @type {?} */
                var descendantCanvases = node.querySelectorAll('canvas');
                // Remove the `id` to avoid having multiple elements with the same id on the page.
                clone.removeAttribute('id');
                for (var i = 0; i < descendantsWithId.length; i++) {
                    descendantsWithId[i].removeAttribute('id');
                }
                // `cloneNode` won't transfer the content of `canvas` elements so we have to do it ourselves.
                // We match up the cloned canvas to their sources using their index in the DOM.
                if (descendantCanvases.length) {
                    /** @type {?} */
                    var cloneCanvases = clone.querySelectorAll('canvas');
                    for (var i = 0; i < descendantCanvases.length; i++) {
                        /** @type {?} */
                        var correspondingCloneContext = cloneCanvases[i].getContext('2d');
                        if (correspondingCloneContext) {
                            correspondingCloneContext.drawImage(descendantCanvases[i], 0, 0);
                        }
                    }
                }
                return clone;
            }
            /**
             * Clamps a value between a minimum and a maximum.
             * @param {?} value
             * @param {?} min
             * @param {?} max
             * @return {?}
             */
            function clamp(value, min, max) {
                return Math.max(min, Math.min(max, value));
            }
            /**
             * Helper to remove an element from the DOM and to do all the necessary null checks.
             * @param {?} element Element to be removed.
             * @return {?}
             */
            function removeElement(element) {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }
            /**
             * Determines whether an event is a touch event.
             * @param {?} event
             * @return {?}
             */
            function isTouchEvent(event) {
                // This function is called for every pixel that the user has dragged so we need it to be
                // as fast as possible. Since we only bind mouse events and touch events, we can assume
                // that if the event's name starts with `t`, it's a touch event.
                return event.type[0] === 't';
            }
            /**
             * Gets the element into which the drag preview should be inserted.
             * @param {?} documentRef
             * @return {?}
             */
            function getPreviewInsertionPoint(documentRef) {
                // We can't use the body if the user is in fullscreen mode,
                // because the preview will render under the fullscreen element.
                // TODO(crisbeto): dedupe this with the `FullscreenOverlayContainer` eventually.
                return documentRef.fullscreenElement ||
                    documentRef.webkitFullscreenElement ||
                    documentRef.mozFullScreenElement ||
                    documentRef.msFullscreenElement ||
                    documentRef.body;
            }
            /**
             * Gets the root HTML element of an embedded view.
             * If the root is not an HTML element it gets wrapped in one.
             * @param {?} viewRef
             * @param {?} _document
             * @return {?}
             */
            function getRootNode(viewRef, _document) {
                /** @type {?} */
                var rootNode = viewRef.rootNodes[0];
                if (rootNode.nodeType !== _document.ELEMENT_NODE) {
                    /** @type {?} */
                    var wrapper = _document.createElement('div');
                    wrapper.appendChild(rootNode);
                    return wrapper;
                }
                return ( /** @type {?} */(rootNode));
            }
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Moves an item one index in an array to another.
             * @template T
             * @param {?} array Array in which to move the item.
             * @param {?} fromIndex Starting index of the item.
             * @param {?} toIndex Index to which the item should be moved.
             * @return {?}
             */
            function moveItemInArray(array, fromIndex, toIndex) {
                /** @type {?} */
                var from = clamp$1(fromIndex, array.length - 1);
                /** @type {?} */
                var to = clamp$1(toIndex, array.length - 1);
                if (from === to) {
                    return;
                }
                /** @type {?} */
                var target = array[from];
                /** @type {?} */
                var delta = to < from ? -1 : 1;
                for (var i = from; i !== to; i += delta) {
                    array[i] = array[i + delta];
                }
                array[to] = target;
            }
            /**
             * Moves an item from one array to another.
             * @template T
             * @param {?} currentArray Array from which to transfer the item.
             * @param {?} targetArray Array into which to put the item.
             * @param {?} currentIndex Index of the item in its current array.
             * @param {?} targetIndex Index at which to insert the item.
             * @return {?}
             */
            function transferArrayItem(currentArray, targetArray, currentIndex, targetIndex) {
                /** @type {?} */
                var from = clamp$1(currentIndex, currentArray.length - 1);
                /** @type {?} */
                var to = clamp$1(targetIndex, targetArray.length);
                if (currentArray.length) {
                    targetArray.splice(to, 0, currentArray.splice(from, 1)[0]);
                }
            }
            /**
             * Copies an item from one array to another, leaving it in its
             * original position in current array.
             * @template T
             * @param {?} currentArray Array from which to copy the item.
             * @param {?} targetArray Array into which is copy the item.
             * @param {?} currentIndex Index of the item in its current array.
             * @param {?} targetIndex Index at which to insert the item.
             *
             * @return {?}
             */
            function copyArrayItem(currentArray, targetArray, currentIndex, targetIndex) {
                /** @type {?} */
                var to = clamp$1(targetIndex, targetArray.length);
                if (currentArray.length) {
                    targetArray.splice(to, 0, currentArray[currentIndex]);
                }
            }
            /**
             * Clamps a number between zero and a maximum.
             * @param {?} value
             * @param {?} max
             * @return {?}
             */
            function clamp$1(value, max) {
                return Math.max(0, Math.min(max, value));
            }
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Counter used to generate unique ids for drop refs.
             * @type {?}
             */
            var _uniqueIdCounter = 0;
            /**
             * Proximity, as a ratio to width/height, at which a
             * dragged item will affect the drop container.
             * @type {?}
             */
            var DROP_PROXIMITY_THRESHOLD = 0.05;
            /**
             * Proximity, as a ratio to width/height at which to start auto-scrolling the drop list or the
             * viewport. The value comes from trying it out manually until it feels right.
             * @type {?}
             */
            var SCROLL_PROXIMITY_THRESHOLD = 0.05;
            /**
             * Number of pixels to scroll for each frame when auto-scrolling an element.
             * The value comes from trying it out manually until it feels right.
             * @type {?}
             */
            var AUTO_SCROLL_STEP = 2;
            /**
             * Reference to a drop list. Used to manipulate or dispose of the container.
             * \@docs-private
             * @template T
             */
            var DropListRef = /** @class */ (function () {
                /**
                 * @param {?} element
                 * @param {?} _dragDropRegistry
                 * @param {?} _document
                 * @param {?=} _ngZone
                 * @param {?=} _viewportRuler
                 */
                function DropListRef(element, _dragDropRegistry, _document, _ngZone, _viewportRuler) {
                    var _this = this;
                    this._dragDropRegistry = _dragDropRegistry;
                    this._ngZone = _ngZone;
                    this._viewportRuler = _viewportRuler;
                    /**
                     * Unique ID for the drop list.
                     * @deprecated No longer being used. To be removed.
                     * \@breaking-change 8.0.0
                     */
                    this.id = "cdk-drop-list-ref-" + _uniqueIdCounter++;
                    /**
                     * Whether starting a dragging sequence from this container is disabled.
                     */
                    this.disabled = false;
                    /**
                     * Whether sorting items within the list is disabled.
                     */
                    this.sortingDisabled = false;
                    /**
                     * Whether auto-scrolling the view when the user
                     * moves their pointer close to the edges is disabled.
                     */
                    this.autoScrollDisabled = false;
                    /**
                     * Function that is used to determine whether an item
                     * is allowed to be moved into a drop container.
                     */
                    this.enterPredicate = ( /**
                     * @return {?}
                     */function () { return true; });
                    /**
                     * Emits right before dragging has started.
                     */
                    this.beforeStarted = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Emits when the user has moved a new drag item into this container.
                     */
                    this.entered = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Emits when the user removes an item from the container
                     * by dragging it into another container.
                     */
                    this.exited = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Emits when the user drops an item inside the container.
                     */
                    this.dropped = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Emits as the user is swapping items while actively dragging.
                     */
                    this.sorted = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Whether an item in the list is being dragged.
                     */
                    this._isDragging = false;
                    /**
                     * Cache of the dimensions of all the items inside the container.
                     */
                    this._itemPositions = [];
                    /**
                     * Keeps track of the container's scroll position.
                     */
                    this._scrollPosition = { top: 0, left: 0 };
                    /**
                     * Keeps track of the scroll position of the viewport.
                     */
                    this._viewportScrollPosition = { top: 0, left: 0 };
                    /**
                     * Keeps track of the item that was last swapped with the dragged item, as
                     * well as what direction the pointer was moving in when the swap occured.
                     */
                    this._previousSwap = { drag: ( /** @type {?} */(null)), delta: 0 };
                    /**
                     * Drop lists that are connected to the current one.
                     */
                    this._siblings = [];
                    /**
                     * Direction in which the list is oriented.
                     */
                    this._orientation = 'vertical';
                    /**
                     * Connected siblings that currently have a dragged item.
                     */
                    this._activeSiblings = new Set();
                    /**
                     * Layout direction of the drop list.
                     */
                    this._direction = 'ltr';
                    /**
                     * Subscription to the window being scrolled.
                     */
                    this._viewportScrollSubscription = rxjs__WEBPACK_IMPORTED_MODULE_2__["Subscription"].EMPTY;
                    /**
                     * Vertical direction in which the list is currently scrolling.
                     */
                    this._verticalScrollDirection = 0 /* NONE */;
                    /**
                     * Horizontal direction in which the list is currently scrolling.
                     */
                    this._horizontalScrollDirection = 0 /* NONE */;
                    /**
                     * Used to signal to the current auto-scroll sequence when to stop.
                     */
                    this._stopScrollTimers = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Handles the container being scrolled. Has to be an arrow function to preserve the context.
                     */
                    this._handleScroll = ( /**
                     * @return {?}
                     */function () {
                        if (!_this.isDragging()) {
                            return;
                        }
                        /** @type {?} */
                        var element = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceElement"])(_this.element);
                        _this._updateAfterScroll(_this._scrollPosition, element.scrollTop, element.scrollLeft);
                    });
                    /**
                     * Starts the interval that'll auto-scroll the element.
                     */
                    this._startScrollInterval = ( /**
                     * @return {?}
                     */function () {
                        _this._stopScrolling();
                        Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["interval"])(0, rxjs__WEBPACK_IMPORTED_MODULE_2__["animationFrameScheduler"])
                            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["takeUntil"])(_this._stopScrollTimers))
                            .subscribe(( /**
                     * @return {?}
                     */function () {
                            /** @type {?} */
                            var node = _this._scrollNode;
                            if (_this._verticalScrollDirection === 1 /* UP */) {
                                incrementVerticalScroll(node, -AUTO_SCROLL_STEP);
                            }
                            else if (_this._verticalScrollDirection === 2 /* DOWN */) {
                                incrementVerticalScroll(node, AUTO_SCROLL_STEP);
                            }
                            if (_this._horizontalScrollDirection === 1 /* LEFT */) {
                                incrementHorizontalScroll(node, -AUTO_SCROLL_STEP);
                            }
                            else if (_this._horizontalScrollDirection === 2 /* RIGHT */) {
                                incrementHorizontalScroll(node, AUTO_SCROLL_STEP);
                            }
                        }));
                    });
                    /** @type {?} */
                    var nativeNode = this.element = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceElement"])(element);
                    this._shadowRoot = getShadowRoot(nativeNode) || _document;
                    _dragDropRegistry.registerDropContainer(this);
                }
                /**
                 * Removes the drop list functionality from the DOM element.
                 * @return {?}
                 */
                DropListRef.prototype.dispose = function () {
                    this._stopScrolling();
                    this._stopScrollTimers.complete();
                    this._removeListeners();
                    this.beforeStarted.complete();
                    this.entered.complete();
                    this.exited.complete();
                    this.dropped.complete();
                    this.sorted.complete();
                    this._activeSiblings.clear();
                    this._scrollNode = ( /** @type {?} */(null));
                    this._dragDropRegistry.removeDropContainer(this);
                };
                /**
                 * Whether an item from this list is currently being dragged.
                 * @return {?}
                 */
                DropListRef.prototype.isDragging = function () {
                    return this._isDragging;
                };
                /**
                 * Starts dragging an item.
                 * @return {?}
                 */
                DropListRef.prototype.start = function () {
                    var _this = this;
                    /** @type {?} */
                    var element = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceElement"])(this.element);
                    this.beforeStarted.next();
                    this._isDragging = true;
                    this._cacheItems();
                    this._siblings.forEach(( /**
                     * @param {?} sibling
                     * @return {?}
                     */function (/**
                     * @param {?} sibling
                     * @return {?}
                     */ sibling) { return sibling._startReceiving(_this); }));
                    this._removeListeners();
                    // @breaking-change 9.0.0 Remove check for _ngZone once it's marked as a required param.
                    if (this._ngZone) {
                        this._ngZone.runOutsideAngular(( /**
                         * @return {?}
                         */function () { return element.addEventListener('scroll', _this._handleScroll); }));
                    }
                    else {
                        element.addEventListener('scroll', this._handleScroll);
                    }
                    // @breaking-change 9.0.0 Remove check for _viewportRuler once it's marked as a required param.
                    if (this._viewportRuler) {
                        this._listenToScrollEvents();
                    }
                };
                /**
                 * Emits an event to indicate that the user moved an item into the container.
                 * @param {?} item Item that was moved into the container.
                 * @param {?} pointerX Position of the item along the X axis.
                 * @param {?} pointerY Position of the item along the Y axis.
                 * @return {?}
                 */
                DropListRef.prototype.enter = function (item, pointerX, pointerY) {
                    this.start();
                    // If sorting is disabled, we want the item to return to its starting
                    // position if the user is returning it to its initial container.
                    /** @type {?} */
                    var newIndex = this.sortingDisabled ? this._draggables.indexOf(item) : -1;
                    if (newIndex === -1) {
                        // We use the coordinates of where the item entered the drop
                        // zone to figure out at which index it should be inserted.
                        newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY);
                    }
                    /** @type {?} */
                    var activeDraggables = this._activeDraggables;
                    /** @type {?} */
                    var currentIndex = activeDraggables.indexOf(item);
                    /** @type {?} */
                    var placeholder = item.getPlaceholderElement();
                    /** @type {?} */
                    var newPositionReference = activeDraggables[newIndex];
                    // If the item at the new position is the same as the item that is being dragged,
                    // it means that we're trying to restore the item to its initial position. In this
                    // case we should use the next item from the list as the reference.
                    if (newPositionReference === item) {
                        newPositionReference = activeDraggables[newIndex + 1];
                    }
                    // Since the item may be in the `activeDraggables` already (e.g. if the user dragged it
                    // into another container and back again), we have to ensure that it isn't duplicated.
                    if (currentIndex > -1) {
                        activeDraggables.splice(currentIndex, 1);
                    }
                    // Don't use items that are being dragged as a reference, because
                    // their element has been moved down to the bottom of the body.
                    if (newPositionReference && !this._dragDropRegistry.isDragging(newPositionReference)) {
                        /** @type {?} */
                        var element = newPositionReference.getRootElement();
                        ( /** @type {?} */(element.parentElement)).insertBefore(placeholder, element);
                        activeDraggables.splice(newIndex, 0, item);
                    }
                    else {
                        Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceElement"])(this.element).appendChild(placeholder);
                        activeDraggables.push(item);
                    }
                    // The transform needs to be cleared so it doesn't throw off the measurements.
                    placeholder.style.transform = '';
                    // Note that the positions were already cached when we called `start` above,
                    // but we need to refresh them since the amount of items has changed.
                    this._cacheItemPositions();
                    this.entered.next({ item: item, container: this, currentIndex: this.getItemIndex(item) });
                };
                /**
                 * Removes an item from the container after it was dragged into another container by the user.
                 * @param {?} item Item that was dragged out.
                 * @return {?}
                 */
                DropListRef.prototype.exit = function (item) {
                    this._reset();
                    this.exited.next({ item: item, container: this });
                };
                /**
                 * Drops an item into this container.
                 * \@breaking-change 9.0.0 `distance` parameter to become required.
                 * @param {?} item Item being dropped into the container.
                 * @param {?} currentIndex Index at which the item should be inserted.
                 * @param {?} previousContainer Container from which the item got dragged in.
                 * @param {?} isPointerOverContainer Whether the user's pointer was over the
                 *    container when the item was dropped.
                 * @param {?=} distance Distance the user has dragged since the start of the dragging sequence.
                 * @return {?}
                 */
                DropListRef.prototype.drop = function (item, currentIndex, previousContainer, isPointerOverContainer, distance) {
                    if (distance === void 0) { distance = { x: 0, y: 0 }; }
                    this._reset();
                    this.dropped.next({
                        item: item,
                        currentIndex: currentIndex,
                        previousIndex: previousContainer.getItemIndex(item),
                        container: this,
                        previousContainer: previousContainer,
                        isPointerOverContainer: isPointerOverContainer,
                        distance: distance
                    });
                };
                /**
                 * Sets the draggable items that are a part of this list.
                 * @template THIS
                 * @this {THIS}
                 * @param {?} items Items that are a part of this list.
                 * @return {THIS}
                 */
                DropListRef.prototype.withItems = function (items) {
                    var _this = this;
                    ( /** @type {?} */(this))._draggables = items;
                    items.forEach(( /**
                     * @param {?} item
                     * @return {?}
                     */function (/**
                     * @param {?} item
                     * @return {?}
                     */ item) { return item._withDropContainer(( /** @type {?} */(_this))); }));
                    if (( /** @type {?} */(this)).isDragging()) {
                        ( /** @type {?} */(this))._cacheItems();
                    }
                    return ( /** @type {?} */(this));
                };
                /**
                 * Sets the layout direction of the drop list.
                 * @template THIS
                 * @this {THIS}
                 * @param {?} direction
                 * @return {THIS}
                 */
                DropListRef.prototype.withDirection = function (direction) {
                    ( /** @type {?} */(this))._direction = direction;
                    return ( /** @type {?} */(this));
                };
                /**
                 * Sets the containers that are connected to this one. When two or more containers are
                 * connected, the user will be allowed to transfer items between them.
                 * @template THIS
                 * @this {THIS}
                 * @param {?} connectedTo Other containers that the current containers should be connected to.
                 * @return {THIS}
                 */
                DropListRef.prototype.connectedTo = function (connectedTo) {
                    ( /** @type {?} */(this))._siblings = connectedTo.slice();
                    return ( /** @type {?} */(this));
                };
                /**
                 * Sets the orientation of the container.
                 * @template THIS
                 * @this {THIS}
                 * @param {?} orientation New orientation for the container.
                 * @return {THIS}
                 */
                DropListRef.prototype.withOrientation = function (orientation) {
                    ( /** @type {?} */(this))._orientation = orientation;
                    return ( /** @type {?} */(this));
                };
                /**
                 * Figures out the index of an item in the container.
                 * @param {?} item Item whose index should be determined.
                 * @return {?}
                 */
                DropListRef.prototype.getItemIndex = function (item) {
                    if (!this._isDragging) {
                        return this._draggables.indexOf(item);
                    }
                    // Items are sorted always by top/left in the cache, however they flow differently in RTL.
                    // The rest of the logic still stands no matter what orientation we're in, however
                    // we need to invert the array when determining the index.
                    /** @type {?} */
                    var items = this._orientation === 'horizontal' && this._direction === 'rtl' ?
                        this._itemPositions.slice().reverse() : this._itemPositions;
                    return findIndex(items, ( /**
                     * @param {?} currentItem
                     * @return {?}
                     */function (/**
                     * @param {?} currentItem
                     * @return {?}
                     */ currentItem) { return currentItem.drag === item; }));
                };
                /**
                 * Whether the list is able to receive the item that
                 * is currently being dragged inside a connected drop list.
                 * @return {?}
                 */
                DropListRef.prototype.isReceiving = function () {
                    return this._activeSiblings.size > 0;
                };
                /**
                 * Sorts an item inside the container based on its position.
                 * @param {?} item Item to be sorted.
                 * @param {?} pointerX Position of the item along the X axis.
                 * @param {?} pointerY Position of the item along the Y axis.
                 * @param {?} pointerDelta Direction in which the pointer is moving along each axis.
                 * @return {?}
                 */
                DropListRef.prototype._sortItem = function (item, pointerX, pointerY, pointerDelta) {
                    // Don't sort the item if sorting is disabled or it's out of range.
                    if (this.sortingDisabled || !this._isPointerNearDropContainer(pointerX, pointerY)) {
                        return;
                    }
                    /** @type {?} */
                    var siblings = this._itemPositions;
                    /** @type {?} */
                    var newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY, pointerDelta);
                    if (newIndex === -1 && siblings.length > 0) {
                        return;
                    }
                    /** @type {?} */
                    var isHorizontal = this._orientation === 'horizontal';
                    /** @type {?} */
                    var currentIndex = findIndex(siblings, ( /**
                     * @param {?} currentItem
                     * @return {?}
                     */function (/**
                     * @param {?} currentItem
                     * @return {?}
                     */ currentItem) { return currentItem.drag === item; }));
                    /** @type {?} */
                    var siblingAtNewPosition = siblings[newIndex];
                    /** @type {?} */
                    var currentPosition = siblings[currentIndex].clientRect;
                    /** @type {?} */
                    var newPosition = siblingAtNewPosition.clientRect;
                    /** @type {?} */
                    var delta = currentIndex > newIndex ? 1 : -1;
                    this._previousSwap.drag = siblingAtNewPosition.drag;
                    this._previousSwap.delta = isHorizontal ? pointerDelta.x : pointerDelta.y;
                    // How many pixels the item's placeholder should be offset.
                    /** @type {?} */
                    var itemOffset = this._getItemOffsetPx(currentPosition, newPosition, delta);
                    // How many pixels all the other items should be offset.
                    /** @type {?} */
                    var siblingOffset = this._getSiblingOffsetPx(currentIndex, siblings, delta);
                    // Save the previous order of the items before moving the item to its new index.
                    // We use this to check whether an item has been moved as a result of the sorting.
                    /** @type {?} */
                    var oldOrder = siblings.slice();
                    // Shuffle the array in place.
                    moveItemInArray(siblings, currentIndex, newIndex);
                    this.sorted.next({
                        previousIndex: currentIndex,
                        currentIndex: newIndex,
                        container: this,
                        item: item
                    });
                    siblings.forEach(( /**
                     * @param {?} sibling
                     * @param {?} index
                     * @return {?}
                     */function (sibling, index) {
                        // Don't do anything if the position hasn't changed.
                        if (oldOrder[index] === sibling) {
                            return;
                        }
                        /** @type {?} */
                        var isDraggedItem = sibling.drag === item;
                        /** @type {?} */
                        var offset = isDraggedItem ? itemOffset : siblingOffset;
                        /** @type {?} */
                        var elementToOffset = isDraggedItem ? item.getPlaceholderElement() :
                            sibling.drag.getRootElement();
                        // Update the offset to reflect the new position.
                        sibling.offset += offset;
                        // Since we're moving the items with a `transform`, we need to adjust their cached
                        // client rects to reflect their new position, as well as swap their positions in the cache.
                        // Note that we shouldn't use `getBoundingClientRect` here to update the cache, because the
                        // elements may be mid-animation which will give us a wrong result.
                        if (isHorizontal) {
                            // Round the transforms since some browsers will
                            // blur the elements, for sub-pixel transforms.
                            elementToOffset.style.transform = "translate3d(" + Math.round(sibling.offset) + "px, 0, 0)";
                            adjustClientRect(sibling.clientRect, 0, offset);
                        }
                        else {
                            elementToOffset.style.transform = "translate3d(0, " + Math.round(sibling.offset) + "px, 0)";
                            adjustClientRect(sibling.clientRect, offset, 0);
                        }
                    }));
                };
                /**
                 * Checks whether the user's pointer is close to the edges of either the
                 * viewport or the drop list and starts the auto-scroll sequence.
                 * @param {?} pointerX User's pointer position along the x axis.
                 * @param {?} pointerY User's pointer position along the y axis.
                 * @return {?}
                 */
                DropListRef.prototype._startScrollingIfNecessary = function (pointerX, pointerY) {
                    var _a;
                    if (this.autoScrollDisabled) {
                        return;
                    }
                    /** @type {?} */
                    var scrollNode;
                    /** @type {?} */
                    var verticalScrollDirection = 0 /* NONE */;
                    /** @type {?} */
                    var horizontalScrollDirection = 0 /* NONE */;
                    // Check whether we should start scrolling the container.
                    if (this._isPointerNearDropContainer(pointerX, pointerY)) {
                        /** @type {?} */
                        var element = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceElement"])(this.element);
                        _a = getElementScrollDirections(element, this._clientRect, pointerX, pointerY), verticalScrollDirection = _a[0], horizontalScrollDirection = _a[1];
                        if (verticalScrollDirection || horizontalScrollDirection) {
                            scrollNode = element;
                        }
                    }
                    // @breaking-change 9.0.0 Remove null check for _viewportRuler once it's a required parameter.
                    // Otherwise check if we can start scrolling the viewport.
                    if (this._viewportRuler && !verticalScrollDirection && !horizontalScrollDirection) {
                        var _b = this._viewportRuler.getViewportSize(), width = _b.width, height = _b.height;
                        /** @type {?} */
                        var clientRect = { width: width, height: height, top: 0, right: width, bottom: height, left: 0 };
                        verticalScrollDirection = getVerticalScrollDirection(clientRect, pointerY);
                        horizontalScrollDirection = getHorizontalScrollDirection(clientRect, pointerX);
                        scrollNode = window;
                    }
                    if (scrollNode && (verticalScrollDirection !== this._verticalScrollDirection ||
                        horizontalScrollDirection !== this._horizontalScrollDirection ||
                        scrollNode !== this._scrollNode)) {
                        this._verticalScrollDirection = verticalScrollDirection;
                        this._horizontalScrollDirection = horizontalScrollDirection;
                        this._scrollNode = scrollNode;
                        if ((verticalScrollDirection || horizontalScrollDirection) && scrollNode) {
                            // @breaking-change 9.0.0 Remove null check for `_ngZone` once it is made required.
                            if (this._ngZone) {
                                this._ngZone.runOutsideAngular(this._startScrollInterval);
                            }
                            else {
                                this._startScrollInterval();
                            }
                        }
                        else {
                            this._stopScrolling();
                        }
                    }
                };
                /**
                 * Stops any currently-running auto-scroll sequences.
                 * @return {?}
                 */
                DropListRef.prototype._stopScrolling = function () {
                    this._stopScrollTimers.next();
                };
                /**
                 * Caches the position of the drop list.
                 * @private
                 * @return {?}
                 */
                DropListRef.prototype._cacheOwnPosition = function () {
                    /** @type {?} */
                    var element = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceElement"])(this.element);
                    this._clientRect = getMutableClientRect(element);
                    this._scrollPosition = { top: element.scrollTop, left: element.scrollLeft };
                };
                /**
                 * Refreshes the position cache of the items and sibling containers.
                 * @private
                 * @return {?}
                 */
                DropListRef.prototype._cacheItemPositions = function () {
                    var _this = this;
                    /** @type {?} */
                    var isHorizontal = this._orientation === 'horizontal';
                    this._itemPositions = this._activeDraggables.map(( /**
                     * @param {?} drag
                     * @return {?}
                     */function (/**
                     * @param {?} drag
                     * @return {?}
                     */ drag) {
                        /** @type {?} */
                        var elementToMeasure = _this._dragDropRegistry.isDragging(drag) ?
                            // If the element is being dragged, we have to measure the
                            // placeholder, because the element is hidden.
                            drag.getPlaceholderElement() :
                            drag.getRootElement();
                        return { drag: drag, offset: 0, clientRect: getMutableClientRect(elementToMeasure) };
                    })).sort(( /**
                     * @param {?} a
                     * @param {?} b
                     * @return {?}
                     */function (a, b) {
                        return isHorizontal ? a.clientRect.left - b.clientRect.left :
                            a.clientRect.top - b.clientRect.top;
                    }));
                };
                /**
                 * Resets the container to its initial state.
                 * @private
                 * @return {?}
                 */
                DropListRef.prototype._reset = function () {
                    var _this = this;
                    this._isDragging = false;
                    // TODO(crisbeto): may have to wait for the animations to finish.
                    this._activeDraggables.forEach(( /**
                     * @param {?} item
                     * @return {?}
                     */function (/**
                     * @param {?} item
                     * @return {?}
                     */ item) { return item.getRootElement().style.transform = ''; }));
                    this._siblings.forEach(( /**
                     * @param {?} sibling
                     * @return {?}
                     */function (/**
                     * @param {?} sibling
                     * @return {?}
                     */ sibling) { return sibling._stopReceiving(_this); }));
                    this._activeDraggables = [];
                    this._itemPositions = [];
                    this._previousSwap.drag = null;
                    this._previousSwap.delta = 0;
                    this._stopScrolling();
                    this._removeListeners();
                };
                /**
                 * Gets the offset in pixels by which the items that aren't being dragged should be moved.
                 * @private
                 * @param {?} currentIndex Index of the item currently being dragged.
                 * @param {?} siblings All of the items in the list.
                 * @param {?} delta Direction in which the user is moving.
                 * @return {?}
                 */
                DropListRef.prototype._getSiblingOffsetPx = function (currentIndex, siblings, delta) {
                    /** @type {?} */
                    var isHorizontal = this._orientation === 'horizontal';
                    /** @type {?} */
                    var currentPosition = siblings[currentIndex].clientRect;
                    /** @type {?} */
                    var immediateSibling = siblings[currentIndex + delta * -1];
                    /** @type {?} */
                    var siblingOffset = currentPosition[isHorizontal ? 'width' : 'height'] * delta;
                    if (immediateSibling) {
                        /** @type {?} */
                        var start = isHorizontal ? 'left' : 'top';
                        /** @type {?} */
                        var end = isHorizontal ? 'right' : 'bottom';
                        // Get the spacing between the start of the current item and the end of the one immediately
                        // after it in the direction in which the user is dragging, or vice versa. We add it to the
                        // offset in order to push the element to where it will be when it's inline and is influenced
                        // by the `margin` of its siblings.
                        if (delta === -1) {
                            siblingOffset -= immediateSibling.clientRect[start] - currentPosition[end];
                        }
                        else {
                            siblingOffset += currentPosition[start] - immediateSibling.clientRect[end];
                        }
                    }
                    return siblingOffset;
                };
                /**
                 * Checks whether the pointer coordinates are close to the drop container.
                 * @private
                 * @param {?} pointerX Coordinates along the X axis.
                 * @param {?} pointerY Coordinates along the Y axis.
                 * @return {?}
                 */
                DropListRef.prototype._isPointerNearDropContainer = function (pointerX, pointerY) {
                    var _a = this._clientRect, top = _a.top, right = _a.right, bottom = _a.bottom, left = _a.left, width = _a.width, height = _a.height;
                    /** @type {?} */
                    var xThreshold = width * DROP_PROXIMITY_THRESHOLD;
                    /** @type {?} */
                    var yThreshold = height * DROP_PROXIMITY_THRESHOLD;
                    return pointerY > top - yThreshold && pointerY < bottom + yThreshold &&
                        pointerX > left - xThreshold && pointerX < right + xThreshold;
                };
                /**
                 * Gets the offset in pixels by which the item that is being dragged should be moved.
                 * @private
                 * @param {?} currentPosition Current position of the item.
                 * @param {?} newPosition Position of the item where the current item should be moved.
                 * @param {?} delta Direction in which the user is moving.
                 * @return {?}
                 */
                DropListRef.prototype._getItemOffsetPx = function (currentPosition, newPosition, delta) {
                    /** @type {?} */
                    var isHorizontal = this._orientation === 'horizontal';
                    /** @type {?} */
                    var itemOffset = isHorizontal ? newPosition.left - currentPosition.left :
                        newPosition.top - currentPosition.top;
                    // Account for differences in the item width/height.
                    if (delta === -1) {
                        itemOffset += isHorizontal ? newPosition.width - currentPosition.width :
                            newPosition.height - currentPosition.height;
                    }
                    return itemOffset;
                };
                /**
                 * Gets the index of an item in the drop container, based on the position of the user's pointer.
                 * @private
                 * @param {?} item Item that is being sorted.
                 * @param {?} pointerX Position of the user's pointer along the X axis.
                 * @param {?} pointerY Position of the user's pointer along the Y axis.
                 * @param {?=} delta Direction in which the user is moving their pointer.
                 * @return {?}
                 */
                DropListRef.prototype._getItemIndexFromPointerPosition = function (item, pointerX, pointerY, delta) {
                    var _this = this;
                    /** @type {?} */
                    var isHorizontal = this._orientation === 'horizontal';
                    return findIndex(this._itemPositions, ( /**
                     * @param {?} __0
                     * @param {?} _
                     * @param {?} array
                     * @return {?}
                     */function (_a, _, array) {
                        var drag = _a.drag, clientRect = _a.clientRect;
                        if (drag === item) {
                            // If there's only one item left in the container, it must be
                            // the dragged item itself so we use it as a reference.
                            return array.length < 2;
                        }
                        if (delta) {
                            /** @type {?} */
                            var direction = isHorizontal ? delta.x : delta.y;
                            // If the user is still hovering over the same item as last time, and they didn't change
                            // the direction in which they're dragging, we don't consider it a direction swap.
                            if (drag === _this._previousSwap.drag && direction === _this._previousSwap.delta) {
                                return false;
                            }
                        }
                        return isHorizontal ?
                            // Round these down since most browsers report client rects with
                            // sub-pixel precision, whereas the pointer coordinates are rounded to pixels.
                            pointerX >= Math.floor(clientRect.left) && pointerX <= Math.floor(clientRect.right) :
                            pointerY >= Math.floor(clientRect.top) && pointerY <= Math.floor(clientRect.bottom);
                    }));
                };
                /**
                 * Caches the current items in the list and their positions.
                 * @private
                 * @return {?}
                 */
                DropListRef.prototype._cacheItems = function () {
                    this._activeDraggables = this._draggables.slice();
                    this._cacheItemPositions();
                    this._cacheOwnPosition();
                };
                /**
                 * Updates the internal state of the container after a scroll event has happened.
                 * @private
                 * @param {?} scrollPosition Object that is keeping track of the scroll position.
                 * @param {?} newTop New top scroll position.
                 * @param {?} newLeft New left scroll position.
                 * @param {?=} extraClientRect Extra `ClientRect` object that should be updated, in addition to the
                 *  ones of the drag items. Useful when the viewport has been scrolled and we also need to update
                 *  the `ClientRect` of the list.
                 * @return {?}
                 */
                DropListRef.prototype._updateAfterScroll = function (scrollPosition, newTop, newLeft, extraClientRect) {
                    var _this = this;
                    /** @type {?} */
                    var topDifference = scrollPosition.top - newTop;
                    /** @type {?} */
                    var leftDifference = scrollPosition.left - newLeft;
                    if (extraClientRect) {
                        adjustClientRect(extraClientRect, topDifference, leftDifference);
                    }
                    // Since we know the amount that the user has scrolled we can shift all of the client rectangles
                    // ourselves. This is cheaper than re-measuring everything and we can avoid inconsistent
                    // behavior where we might be measuring the element before its position has changed.
                    this._itemPositions.forEach(( /**
                     * @param {?} __0
                     * @return {?}
                     */function (_a) {
                        var clientRect = _a.clientRect;
                        adjustClientRect(clientRect, topDifference, leftDifference);
                    }));
                    // We need two loops for this, because we want all of the cached
                    // positions to be up-to-date before we re-sort the item.
                    this._itemPositions.forEach(( /**
                     * @param {?} __0
                     * @return {?}
                     */function (_a) {
                        var drag = _a.drag;
                        if (_this._dragDropRegistry.isDragging(drag)) {
                            // We need to re-sort the item manually, because the pointer move
                            // events won't be dispatched while the user is scrolling.
                            drag._sortFromLastPointerPosition();
                        }
                    }));
                    scrollPosition.top = newTop;
                    scrollPosition.left = newLeft;
                };
                /**
                 * Removes the event listeners associated with this drop list.
                 * @private
                 * @return {?}
                 */
                DropListRef.prototype._removeListeners = function () {
                    Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceElement"])(this.element).removeEventListener('scroll', this._handleScroll);
                    this._viewportScrollSubscription.unsubscribe();
                };
                /**
                 * Checks whether the user's pointer is positioned over the container.
                 * @param {?} x Pointer position along the X axis.
                 * @param {?} y Pointer position along the Y axis.
                 * @return {?}
                 */
                DropListRef.prototype._isOverContainer = function (x, y) {
                    return isInsideClientRect(this._clientRect, x, y);
                };
                /**
                 * Figures out whether an item should be moved into a sibling
                 * drop container, based on its current position.
                 * @param {?} item Drag item that is being moved.
                 * @param {?} x Position of the item along the X axis.
                 * @param {?} y Position of the item along the Y axis.
                 * @return {?}
                 */
                DropListRef.prototype._getSiblingContainerFromPosition = function (item, x, y) {
                    return this._siblings.find(( /**
                     * @param {?} sibling
                     * @return {?}
                     */function (/**
                     * @param {?} sibling
                     * @return {?}
                     */ sibling) { return sibling._canReceive(item, x, y); }));
                };
                /**
                 * Checks whether the drop list can receive the passed-in item.
                 * @param {?} item Item that is being dragged into the list.
                 * @param {?} x Position of the item along the X axis.
                 * @param {?} y Position of the item along the Y axis.
                 * @return {?}
                 */
                DropListRef.prototype._canReceive = function (item, x, y) {
                    if (!this.enterPredicate(item, this) || !isInsideClientRect(this._clientRect, x, y)) {
                        return false;
                    }
                    /** @type {?} */
                    var elementFromPoint = ( /** @type {?} */(this._shadowRoot.elementFromPoint(x, y)));
                    // If there's no element at the pointer position, then
                    // the client rect is probably scrolled out of the view.
                    if (!elementFromPoint) {
                        return false;
                    }
                    /** @type {?} */
                    var nativeElement = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceElement"])(this.element);
                    // The `ClientRect`, that we're using to find the container over which the user is
                    // hovering, doesn't give us any information on whether the element has been scrolled
                    // out of the view or whether it's overlapping with other containers. This means that
                    // we could end up transferring the item into a container that's invisible or is positioned
                    // below another one. We use the result from `elementFromPoint` to get the top-most element
                    // at the pointer position and to find whether it's one of the intersecting drop containers.
                    return elementFromPoint === nativeElement || nativeElement.contains(elementFromPoint);
                };
                /**
                 * Called by one of the connected drop lists when a dragging sequence has started.
                 * @param {?} sibling Sibling in which dragging has started.
                 * @return {?}
                 */
                DropListRef.prototype._startReceiving = function (sibling) {
                    /** @type {?} */
                    var activeSiblings = this._activeSiblings;
                    if (!activeSiblings.has(sibling)) {
                        activeSiblings.add(sibling);
                        this._cacheOwnPosition();
                        this._listenToScrollEvents();
                    }
                };
                /**
                 * Called by a connected drop list when dragging has stopped.
                 * @param {?} sibling Sibling whose dragging has stopped.
                 * @return {?}
                 */
                DropListRef.prototype._stopReceiving = function (sibling) {
                    this._activeSiblings.delete(sibling);
                    this._viewportScrollSubscription.unsubscribe();
                };
                /**
                 * Starts listening to scroll events on the viewport.
                 * Used for updating the internal state of the list.
                 * @private
                 * @return {?}
                 */
                DropListRef.prototype._listenToScrollEvents = function () {
                    var _this = this;
                    this._viewportScrollPosition = ( /** @type {?} */(this._viewportRuler)).getViewportScrollPosition();
                    this._viewportScrollSubscription = this._dragDropRegistry.scroll.subscribe(( /**
                     * @return {?}
                     */function () {
                        if (_this.isDragging()) {
                            /** @type {?} */
                            var newPosition = ( /** @type {?} */(_this._viewportRuler)).getViewportScrollPosition();
                            _this._updateAfterScroll(_this._viewportScrollPosition, newPosition.top, newPosition.left, _this._clientRect);
                        }
                        else if (_this.isReceiving()) {
                            _this._cacheOwnPosition();
                        }
                    }));
                };
                return DropListRef;
            }());
            /**
             * Updates the top/left positions of a `ClientRect`, as well as their bottom/right counterparts.
             * @param {?} clientRect `ClientRect` that should be updated.
             * @param {?} top Amount to add to the `top` position.
             * @param {?} left Amount to add to the `left` position.
             * @return {?}
             */
            function adjustClientRect(clientRect, top, left) {
                clientRect.top += top;
                clientRect.bottom = clientRect.top + clientRect.height;
                clientRect.left += left;
                clientRect.right = clientRect.left + clientRect.width;
            }
            /**
             * Finds the index of an item that matches a predicate function. Used as an equivalent
             * of `Array.prototype.findIndex` which isn't part of the standard Google typings.
             * @template T
             * @param {?} array Array in which to look for matches.
             * @param {?} predicate Function used to determine whether an item is a match.
             * @return {?}
             */
            function findIndex(array, predicate) {
                for (var i = 0; i < array.length; i++) {
                    if (predicate(array[i], i, array)) {
                        return i;
                    }
                }
                return -1;
            }
            /**
             * Checks whether some coordinates are within a `ClientRect`.
             * @param {?} clientRect ClientRect that is being checked.
             * @param {?} x Coordinates along the X axis.
             * @param {?} y Coordinates along the Y axis.
             * @return {?}
             */
            function isInsideClientRect(clientRect, x, y) {
                var top = clientRect.top, bottom = clientRect.bottom, left = clientRect.left, right = clientRect.right;
                return y >= top && y <= bottom && x >= left && x <= right;
            }
            /**
             * Gets a mutable version of an element's bounding `ClientRect`.
             * @param {?} element
             * @return {?}
             */
            function getMutableClientRect(element) {
                /** @type {?} */
                var clientRect = element.getBoundingClientRect();
                // We need to clone the `clientRect` here, because all the values on it are readonly
                // and we need to be able to update them. Also we can't use a spread here, because
                // the values on a `ClientRect` aren't own properties. See:
                // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect#Notes
                return {
                    top: clientRect.top,
                    right: clientRect.right,
                    bottom: clientRect.bottom,
                    left: clientRect.left,
                    width: clientRect.width,
                    height: clientRect.height
                };
            }
            /**
             * Increments the vertical scroll position of a node.
             * @param {?} node Node whose scroll position should change.
             * @param {?} amount Amount of pixels that the `node` should be scrolled.
             * @return {?}
             */
            function incrementVerticalScroll(node, amount) {
                if (node === window) {
                    (( /** @type {?} */(node))).scrollBy(0, amount);
                }
                else {
                    // Ideally we could use `Element.scrollBy` here as well, but IE and Edge don't support it.
                    (( /** @type {?} */(node))).scrollTop += amount;
                }
            }
            /**
             * Increments the horizontal scroll position of a node.
             * @param {?} node Node whose scroll position should change.
             * @param {?} amount Amount of pixels that the `node` should be scrolled.
             * @return {?}
             */
            function incrementHorizontalScroll(node, amount) {
                if (node === window) {
                    (( /** @type {?} */(node))).scrollBy(amount, 0);
                }
                else {
                    // Ideally we could use `Element.scrollBy` here as well, but IE and Edge don't support it.
                    (( /** @type {?} */(node))).scrollLeft += amount;
                }
            }
            /**
             * Gets whether the vertical auto-scroll direction of a node.
             * @param {?} clientRect Dimensions of the node.
             * @param {?} pointerY Position of the user's pointer along the y axis.
             * @return {?}
             */
            function getVerticalScrollDirection(clientRect, pointerY) {
                var top = clientRect.top, bottom = clientRect.bottom, height = clientRect.height;
                /** @type {?} */
                var yThreshold = height * SCROLL_PROXIMITY_THRESHOLD;
                if (pointerY >= top - yThreshold && pointerY <= top + yThreshold) {
                    return 1 /* UP */;
                }
                else if (pointerY >= bottom - yThreshold && pointerY <= bottom + yThreshold) {
                    return 2 /* DOWN */;
                }
                return 0 /* NONE */;
            }
            /**
             * Gets whether the horizontal auto-scroll direction of a node.
             * @param {?} clientRect Dimensions of the node.
             * @param {?} pointerX Position of the user's pointer along the x axis.
             * @return {?}
             */
            function getHorizontalScrollDirection(clientRect, pointerX) {
                var left = clientRect.left, right = clientRect.right, width = clientRect.width;
                /** @type {?} */
                var xThreshold = width * SCROLL_PROXIMITY_THRESHOLD;
                if (pointerX >= left - xThreshold && pointerX <= left + xThreshold) {
                    return 1 /* LEFT */;
                }
                else if (pointerX >= right - xThreshold && pointerX <= right + xThreshold) {
                    return 2 /* RIGHT */;
                }
                return 0 /* NONE */;
            }
            /**
             * Gets the directions in which an element node should be scrolled,
             * assuming that the user's pointer is already within it scrollable region.
             * @param {?} element Element for which we should calculate the scroll direction.
             * @param {?} clientRect Bounding client rectangle of the element.
             * @param {?} pointerX Position of the user's pointer along the x axis.
             * @param {?} pointerY Position of the user's pointer along the y axis.
             * @return {?}
             */
            function getElementScrollDirections(element, clientRect, pointerX, pointerY) {
                /** @type {?} */
                var computedVertical = getVerticalScrollDirection(clientRect, pointerY);
                /** @type {?} */
                var computedHorizontal = getHorizontalScrollDirection(clientRect, pointerX);
                /** @type {?} */
                var verticalScrollDirection = 0 /* NONE */;
                /** @type {?} */
                var horizontalScrollDirection = 0 /* NONE */;
                // Note that we here we do some extra checks for whether the element is actually scrollable in
                // a certain direction and we only assign the scroll direction if it is. We do this so that we
                // can allow other elements to be scrolled, if the current element can't be scrolled anymore.
                // This allows us to handle cases where the scroll regions of two scrollable elements overlap.
                if (computedVertical) {
                    /** @type {?} */
                    var scrollTop = element.scrollTop;
                    if (computedVertical === 1 /* UP */) {
                        if (scrollTop > 0) {
                            verticalScrollDirection = 1 /* UP */;
                        }
                    }
                    else if (element.scrollHeight - scrollTop > element.clientHeight) {
                        verticalScrollDirection = 2 /* DOWN */;
                    }
                }
                if (computedHorizontal) {
                    /** @type {?} */
                    var scrollLeft = element.scrollLeft;
                    if (computedHorizontal === 1 /* LEFT */) {
                        if (scrollLeft > 0) {
                            horizontalScrollDirection = 1 /* LEFT */;
                        }
                    }
                    else if (element.scrollWidth - scrollLeft > element.clientWidth) {
                        horizontalScrollDirection = 2 /* RIGHT */;
                    }
                }
                return [verticalScrollDirection, horizontalScrollDirection];
            }
            /**
             * Gets the shadow root of an element, if any.
             * @param {?} element
             * @return {?}
             */
            function getShadowRoot(element) {
                if (Object(_angular_cdk_platform__WEBPACK_IMPORTED_MODULE_0__["_supportsShadowDom"])()) {
                    /** @type {?} */
                    var rootNode = element.getRootNode ? element.getRootNode() : null;
                    if (rootNode instanceof ShadowRoot) {
                        return rootNode;
                    }
                }
                return null;
            }
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Event options that can be used to bind an active, capturing event.
             * @type {?}
             */
            var activeCapturingEventOptions = Object(_angular_cdk_platform__WEBPACK_IMPORTED_MODULE_0__["normalizePassiveListenerOptions"])({
                passive: false,
                capture: true
            });
            /**
             * Service that keeps track of all the drag item and drop container
             * instances, and manages global event listeners on the `document`.
             * \@docs-private
             * @template I, C
             */
            // Note: this class is generic, rather than referencing CdkDrag and CdkDropList directly, in order
            // to avoid circular imports. If we were to reference them here, importing the registry into the
            // classes that are registering themselves will introduce a circular import.
            var DragDropRegistry = /** @class */ (function () {
                /**
                 * @param {?} _ngZone
                 * @param {?} _document
                 */
                function DragDropRegistry(_ngZone, _document) {
                    var _this = this;
                    this._ngZone = _ngZone;
                    /**
                     * Registered drop container instances.
                     */
                    this._dropInstances = new Set();
                    /**
                     * Registered drag item instances.
                     */
                    this._dragInstances = new Set();
                    /**
                     * Drag item instances that are currently being dragged.
                     */
                    this._activeDragInstances = new Set();
                    /**
                     * Keeps track of the event listeners that we've bound to the `document`.
                     */
                    this._globalListeners = new Map();
                    /**
                     * Emits the `touchmove` or `mousemove` events that are dispatched
                     * while the user is dragging a drag item instance.
                     */
                    this.pointerMove = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Emits the `touchend` or `mouseup` events that are dispatched
                     * while the user is dragging a drag item instance.
                     */
                    this.pointerUp = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Emits when the viewport has been scrolled while the user is dragging an item.
                     */
                    this.scroll = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Event listener that will prevent the default browser action while the user is dragging.
                     * @param event Event whose default action should be prevented.
                     */
                    this._preventDefaultWhileDragging = ( /**
                     * @param {?} event
                     * @return {?}
                     */function (event) {
                        if (_this._activeDragInstances.size) {
                            event.preventDefault();
                        }
                    });
                    this._document = _document;
                }
                /**
                 * Adds a drop container to the registry.
                 * @param {?} drop
                 * @return {?}
                 */
                DragDropRegistry.prototype.registerDropContainer = function (drop) {
                    if (!this._dropInstances.has(drop)) {
                        if (this.getDropContainer(drop.id)) {
                            throw Error("Drop instance with id \"" + drop.id + "\" has already been registered.");
                        }
                        this._dropInstances.add(drop);
                    }
                };
                /**
                 * Adds a drag item instance to the registry.
                 * @param {?} drag
                 * @return {?}
                 */
                DragDropRegistry.prototype.registerDragItem = function (drag) {
                    var _this = this;
                    this._dragInstances.add(drag);
                    // The `touchmove` event gets bound once, ahead of time, because WebKit
                    // won't preventDefault on a dynamically-added `touchmove` listener.
                    // See https://bugs.webkit.org/show_bug.cgi?id=184250.
                    if (this._dragInstances.size === 1) {
                        this._ngZone.runOutsideAngular(( /**
                         * @return {?}
                         */function () {
                            // The event handler has to be explicitly active,
                            // because newer browsers make it passive by default.
                            _this._document.addEventListener('touchmove', _this._preventDefaultWhileDragging, activeCapturingEventOptions);
                        }));
                    }
                };
                /**
                 * Removes a drop container from the registry.
                 * @param {?} drop
                 * @return {?}
                 */
                DragDropRegistry.prototype.removeDropContainer = function (drop) {
                    this._dropInstances.delete(drop);
                };
                /**
                 * Removes a drag item instance from the registry.
                 * @param {?} drag
                 * @return {?}
                 */
                DragDropRegistry.prototype.removeDragItem = function (drag) {
                    this._dragInstances.delete(drag);
                    this.stopDragging(drag);
                    if (this._dragInstances.size === 0) {
                        this._document.removeEventListener('touchmove', this._preventDefaultWhileDragging, activeCapturingEventOptions);
                    }
                };
                /**
                 * Starts the dragging sequence for a drag instance.
                 * @param {?} drag Drag instance which is being dragged.
                 * @param {?} event Event that initiated the dragging.
                 * @return {?}
                 */
                DragDropRegistry.prototype.startDragging = function (drag, event) {
                    var _this = this;
                    // Do not process the same drag twice to avoid memory leaks and redundant listeners
                    if (this._activeDragInstances.has(drag)) {
                        return;
                    }
                    this._activeDragInstances.add(drag);
                    if (this._activeDragInstances.size === 1) {
                        /** @type {?} */
                        var isTouchEvent_1 = event.type.startsWith('touch');
                        /** @type {?} */
                        var moveEvent = isTouchEvent_1 ? 'touchmove' : 'mousemove';
                        /** @type {?} */
                        var upEvent = isTouchEvent_1 ? 'touchend' : 'mouseup';
                        // We explicitly bind __active__ listeners here, because newer browsers will default to
                        // passive ones for `mousemove` and `touchmove`. The events need to be active, because we
                        // use `preventDefault` to prevent the page from scrolling while the user is dragging.
                        this._globalListeners
                            .set(moveEvent, {
                            handler: ( /**
                             * @param {?} e
                             * @return {?}
                             */function (e) { return _this.pointerMove.next(( /** @type {?} */(e))); }),
                            options: activeCapturingEventOptions
                        })
                            .set(upEvent, {
                            handler: ( /**
                             * @param {?} e
                             * @return {?}
                             */function (e) { return _this.pointerUp.next(( /** @type {?} */(e))); }),
                            options: true
                        })
                            .set('scroll', {
                            handler: ( /**
                             * @param {?} e
                             * @return {?}
                             */function (e) { return _this.scroll.next(e); }),
                            // Use capturing so that we pick up scroll changes in any scrollable nodes that aren't
                            // the document. See https://github.com/angular/components/issues/17144.
                            options: true
                        })
                            // Preventing the default action on `mousemove` isn't enough to disable text selection
                            // on Safari so we need to prevent the selection event as well. Alternatively this can
                            // be done by setting `user-select: none` on the `body`, however it has causes a style
                            // recalculation which can be expensive on pages with a lot of elements.
                            .set('selectstart', {
                            handler: this._preventDefaultWhileDragging,
                            options: activeCapturingEventOptions
                        });
                        this._ngZone.runOutsideAngular(( /**
                         * @return {?}
                         */function () {
                            _this._globalListeners.forEach(( /**
                             * @param {?} config
                             * @param {?} name
                             * @return {?}
                             */function (config, name) {
                                _this._document.addEventListener(name, config.handler, config.options);
                            }));
                        }));
                    }
                };
                /**
                 * Stops dragging a drag item instance.
                 * @param {?} drag
                 * @return {?}
                 */
                DragDropRegistry.prototype.stopDragging = function (drag) {
                    this._activeDragInstances.delete(drag);
                    if (this._activeDragInstances.size === 0) {
                        this._clearGlobalListeners();
                    }
                };
                /**
                 * Gets whether a drag item instance is currently being dragged.
                 * @param {?} drag
                 * @return {?}
                 */
                DragDropRegistry.prototype.isDragging = function (drag) {
                    return this._activeDragInstances.has(drag);
                };
                /**
                 * Gets a drop container by its id.
                 * @deprecated No longer being used. To be removed.
                 * \@breaking-change 8.0.0
                 * @param {?} id
                 * @return {?}
                 */
                DragDropRegistry.prototype.getDropContainer = function (id) {
                    return Array.from(this._dropInstances).find(( /**
                     * @param {?} instance
                     * @return {?}
                     */function (/**
                     * @param {?} instance
                     * @return {?}
                     */ instance) { return instance.id === id; }));
                };
                /**
                 * @return {?}
                 */
                DragDropRegistry.prototype.ngOnDestroy = function () {
                    var _this = this;
                    this._dragInstances.forEach(( /**
                     * @param {?} instance
                     * @return {?}
                     */function (/**
                     * @param {?} instance
                     * @return {?}
                     */ instance) { return _this.removeDragItem(instance); }));
                    this._dropInstances.forEach(( /**
                     * @param {?} instance
                     * @return {?}
                     */function (/**
                     * @param {?} instance
                     * @return {?}
                     */ instance) { return _this.removeDropContainer(instance); }));
                    this._clearGlobalListeners();
                    this.pointerMove.complete();
                    this.pointerUp.complete();
                };
                /**
                 * Clears out the global event listeners from the `document`.
                 * @private
                 * @return {?}
                 */
                DragDropRegistry.prototype._clearGlobalListeners = function () {
                    var _this = this;
                    this._globalListeners.forEach(( /**
                     * @param {?} config
                     * @param {?} name
                     * @return {?}
                     */function (config, name) {
                        _this._document.removeEventListener(name, config.handler, config.options);
                    }));
                    this._globalListeners.clear();
                };
                return DragDropRegistry;
            }());
            DragDropRegistry.decorators = [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Injectable"], args: [{ providedIn: 'root' },] },
            ];
            /** @nocollapse */
            DragDropRegistry.ctorParameters = function () { return [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["NgZone"] },
                { type: undefined, decorators: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Inject"], args: [_angular_common__WEBPACK_IMPORTED_MODULE_5__["DOCUMENT"],] }] }
            ]; };
            /** @nocollapse */ DragDropRegistry.ngInjectableDef = Object(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineInjectable"])({ factory: function DragDropRegistry_Factory() { return new DragDropRegistry(Object(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"])(_angular_core__WEBPACK_IMPORTED_MODULE_4__["NgZone"]), Object(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"])(_angular_common__WEBPACK_IMPORTED_MODULE_5__["DOCUMENT"])); }, token: DragDropRegistry, providedIn: "root" });
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Default configuration to be used when creating a `DragRef`.
             * @type {?}
             */
            var DEFAULT_CONFIG = {
                dragStartThreshold: 5,
                pointerDirectionChangeThreshold: 5
            };
            /**
             * Service that allows for drag-and-drop functionality to be attached to DOM elements.
             */
            var DragDrop = /** @class */ (function () {
                /**
                 * @param {?} _document
                 * @param {?} _ngZone
                 * @param {?} _viewportRuler
                 * @param {?} _dragDropRegistry
                 */
                function DragDrop(_document, _ngZone, _viewportRuler, _dragDropRegistry) {
                    this._document = _document;
                    this._ngZone = _ngZone;
                    this._viewportRuler = _viewportRuler;
                    this._dragDropRegistry = _dragDropRegistry;
                }
                /**
                 * Turns an element into a draggable item.
                 * @template T
                 * @param {?} element Element to which to attach the dragging functionality.
                 * @param {?=} config Object used to configure the dragging behavior.
                 * @return {?}
                 */
                DragDrop.prototype.createDrag = function (element, config) {
                    if (config === void 0) { config = DEFAULT_CONFIG; }
                    return new DragRef(element, config, this._document, this._ngZone, this._viewportRuler, this._dragDropRegistry);
                };
                /**
                 * Turns an element into a drop list.
                 * @template T
                 * @param {?} element Element to which to attach the drop list functionality.
                 * @return {?}
                 */
                DragDrop.prototype.createDropList = function (element) {
                    return new DropListRef(element, this._dragDropRegistry, this._document, this._ngZone, this._viewportRuler);
                };
                return DragDrop;
            }());
            DragDrop.decorators = [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Injectable"], args: [{ providedIn: 'root' },] },
            ];
            /** @nocollapse */
            DragDrop.ctorParameters = function () { return [
                { type: undefined, decorators: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Inject"], args: [_angular_common__WEBPACK_IMPORTED_MODULE_5__["DOCUMENT"],] }] },
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["NgZone"] },
                { type: _angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_6__["ViewportRuler"] },
                { type: DragDropRegistry }
            ]; };
            /** @nocollapse */ DragDrop.ngInjectableDef = Object(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵdefineInjectable"])({ factory: function DragDrop_Factory() { return new DragDrop(Object(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"])(_angular_common__WEBPACK_IMPORTED_MODULE_5__["DOCUMENT"]), Object(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"])(_angular_core__WEBPACK_IMPORTED_MODULE_4__["NgZone"]), Object(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"])(_angular_cdk_scrolling__WEBPACK_IMPORTED_MODULE_6__["ViewportRuler"]), Object(_angular_core__WEBPACK_IMPORTED_MODULE_4__["ɵɵinject"])(DragDropRegistry)); }, token: DragDrop, providedIn: "root" });
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Injection token that is used to provide a CdkDropList instance to CdkDrag.
             * Used for avoiding circular imports.
             * @type {?}
             */
            var CDK_DROP_LIST = new _angular_core__WEBPACK_IMPORTED_MODULE_4__["InjectionToken"]('CDK_DROP_LIST');
            /**
             * Injection token that is used to provide a CdkDropList instance to CdkDrag.
             * Used for avoiding circular imports.
             * @deprecated Use `CDK_DROP_LIST` instead.
             * \@breaking-change 8.0.0
             * @type {?}
             */
            var CDK_DROP_LIST_CONTAINER = CDK_DROP_LIST;
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Injection token that can be used for a `CdkDrag` to provide itself as a parent to the
             * drag-specific child directive (`CdkDragHandle`, `CdkDragPreview` etc.). Used primarily
             * to avoid circular imports.
             * \@docs-private
             * @type {?}
             */
            var CDK_DRAG_PARENT = new _angular_core__WEBPACK_IMPORTED_MODULE_4__["InjectionToken"]('CDK_DRAG_PARENT');
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Handle that can be used to drag and CdkDrag instance.
             */
            var CdkDragHandle = /** @class */ (function () {
                /**
                 * @param {?} element
                 * @param {?=} parentDrag
                 */
                function CdkDragHandle(element, parentDrag) {
                    this.element = element;
                    /**
                     * Emits when the state of the handle has changed.
                     */
                    this._stateChanges = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    this._disabled = false;
                    this._parentDrag = parentDrag;
                    toggleNativeDragInteractions(element.nativeElement, false);
                }
                Object.defineProperty(CdkDragHandle.prototype, "disabled", {
                    /**
                     * Whether starting to drag through this handle is disabled.
                     * @return {?}
                     */
                    get: function () { return this._disabled; },
                    /**
                     * @param {?} value
                     * @return {?}
                     */
                    set: function (value) {
                        this._disabled = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceBooleanProperty"])(value);
                        this._stateChanges.next(this);
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * @return {?}
                 */
                CdkDragHandle.prototype.ngOnDestroy = function () {
                    this._stateChanges.complete();
                };
                return CdkDragHandle;
            }());
            CdkDragHandle.decorators = [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Directive"], args: [{
                            selector: '[cdkDragHandle]',
                            host: {
                                'class': 'cdk-drag-handle'
                            }
                        },] },
            ];
            /** @nocollapse */
            CdkDragHandle.ctorParameters = function () { return [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["ElementRef"] },
                { type: undefined, decorators: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Inject"], args: [CDK_DRAG_PARENT,] }, { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Optional"] }] }
            ]; };
            CdkDragHandle.propDecorators = {
                disabled: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDragHandleDisabled',] }]
            };
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Element that will be used as a template for the placeholder of a CdkDrag when
             * it is being dragged. The placeholder is displayed in place of the element being dragged.
             * @template T
             */
            var CdkDragPlaceholder = /** @class */ (function () {
                /**
                 * @param {?} templateRef
                 */
                function CdkDragPlaceholder(templateRef) {
                    this.templateRef = templateRef;
                }
                return CdkDragPlaceholder;
            }());
            CdkDragPlaceholder.decorators = [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Directive"], args: [{
                            selector: 'ng-template[cdkDragPlaceholder]'
                        },] },
            ];
            /** @nocollapse */
            CdkDragPlaceholder.ctorParameters = function () { return [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["TemplateRef"] }
            ]; };
            CdkDragPlaceholder.propDecorators = {
                data: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"] }]
            };
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Element that will be used as a template for the preview
             * of a CdkDrag when it is being dragged.
             * @template T
             */
            var CdkDragPreview = /** @class */ (function () {
                /**
                 * @param {?} templateRef
                 */
                function CdkDragPreview(templateRef) {
                    this.templateRef = templateRef;
                }
                return CdkDragPreview;
            }());
            CdkDragPreview.decorators = [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Directive"], args: [{
                            selector: 'ng-template[cdkDragPreview]'
                        },] },
            ];
            /** @nocollapse */
            CdkDragPreview.ctorParameters = function () { return [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["TemplateRef"] }
            ]; };
            CdkDragPreview.propDecorators = {
                data: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"] }]
            };
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Injection token that can be used to configure the behavior of `CdkDrag`.
             * @type {?}
             */
            var CDK_DRAG_CONFIG = new _angular_core__WEBPACK_IMPORTED_MODULE_4__["InjectionToken"]('CDK_DRAG_CONFIG', {
                providedIn: 'root',
                factory: CDK_DRAG_CONFIG_FACTORY
            });
            /**
             * \@docs-private
             * @return {?}
             */
            function CDK_DRAG_CONFIG_FACTORY() {
                return { dragStartThreshold: 5, pointerDirectionChangeThreshold: 5 };
            }
            /**
             * Element that can be moved inside a CdkDropList container.
             * @template T
             */
            var CdkDrag = /** @class */ (function () {
                /**
                 * @param {?} element
                 * @param {?} dropContainer
                 * @param {?} _document
                 * @param {?} _ngZone
                 * @param {?} _viewContainerRef
                 * @param {?} config
                 * @param {?} _dir
                 * @param {?} dragDrop
                 * @param {?} _changeDetectorRef
                 */
                function CdkDrag(element, dropContainer, _document, _ngZone, _viewContainerRef, config, _dir, dragDrop, _changeDetectorRef) {
                    var _this = this;
                    this.element = element;
                    this.dropContainer = dropContainer;
                    this._document = _document;
                    this._ngZone = _ngZone;
                    this._viewContainerRef = _viewContainerRef;
                    this._dir = _dir;
                    this._changeDetectorRef = _changeDetectorRef;
                    this._destroyed = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Amount of milliseconds to wait after the user has put their
                     * pointer down before starting to drag the element.
                     */
                    this.dragStartDelay = 0;
                    this._disabled = false;
                    /**
                     * Emits when the user starts dragging the item.
                     */
                    this.started = new _angular_core__WEBPACK_IMPORTED_MODULE_4__["EventEmitter"]();
                    /**
                     * Emits when the user has released a drag item, before any animations have started.
                     */
                    this.released = new _angular_core__WEBPACK_IMPORTED_MODULE_4__["EventEmitter"]();
                    /**
                     * Emits when the user stops dragging an item in the container.
                     */
                    this.ended = new _angular_core__WEBPACK_IMPORTED_MODULE_4__["EventEmitter"]();
                    /**
                     * Emits when the user has moved the item into a new container.
                     */
                    this.entered = new _angular_core__WEBPACK_IMPORTED_MODULE_4__["EventEmitter"]();
                    /**
                     * Emits when the user removes the item its container by dragging it into another container.
                     */
                    this.exited = new _angular_core__WEBPACK_IMPORTED_MODULE_4__["EventEmitter"]();
                    /**
                     * Emits when the user drops the item inside a container.
                     */
                    this.dropped = new _angular_core__WEBPACK_IMPORTED_MODULE_4__["EventEmitter"]();
                    /**
                     * Emits as the user is dragging the item. Use with caution,
                     * because this event will fire for every pixel that the user has dragged.
                     */
                    this.moved = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Observable"](( /**
                     * @param {?} observer
                     * @return {?}
                     */function (observer) {
                        /** @type {?} */
                        var subscription = _this._dragRef.moved.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["map"])(( /**
                         * @param {?} movedEvent
                         * @return {?}
                         */function (/**
                         * @param {?} movedEvent
                         * @return {?}
                         */ movedEvent) { return ({
                            source: _this,
                            pointerPosition: movedEvent.pointerPosition,
                            event: movedEvent.event,
                            delta: movedEvent.delta,
                            distance: movedEvent.distance
                        }); }))).subscribe(observer);
                        return ( /**
                         * @return {?}
                         */function () {
                            subscription.unsubscribe();
                        });
                    }));
                    this._dragRef = dragDrop.createDrag(element, config);
                    this._dragRef.data = this;
                    this._syncInputs(this._dragRef);
                    this._handleEvents(this._dragRef);
                }
                Object.defineProperty(CdkDrag.prototype, "boundaryElementSelector", {
                    /**
                     * Selector that will be used to determine the element to which the draggable's position will
                     * be constrained. Matching starts from the element's parent and goes up the DOM until a matching
                     * element has been found
                     * @deprecated Use `boundaryElement` instead.
                     * \@breaking-change 9.0.0
                     * @return {?}
                     */
                    get: function () {
                        return typeof this.boundaryElement === 'string' ? this.boundaryElement : ( /** @type {?} */(undefined));
                    },
                    /**
                     * @param {?} selector
                     * @return {?}
                     */
                    set: function (selector) {
                        this.boundaryElement = selector;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(CdkDrag.prototype, "disabled", {
                    /**
                     * Whether starting to drag this element is disabled.
                     * @return {?}
                     */
                    get: function () {
                        return this._disabled || (this.dropContainer && this.dropContainer.disabled);
                    },
                    /**
                     * @param {?} value
                     * @return {?}
                     */
                    set: function (value) {
                        this._disabled = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceBooleanProperty"])(value);
                        this._dragRef.disabled = this._disabled;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Returns the element that is being used as a placeholder
                 * while the current element is being dragged.
                 * @return {?}
                 */
                CdkDrag.prototype.getPlaceholderElement = function () {
                    return this._dragRef.getPlaceholderElement();
                };
                /**
                 * Returns the root draggable element.
                 * @return {?}
                 */
                CdkDrag.prototype.getRootElement = function () {
                    return this._dragRef.getRootElement();
                };
                /**
                 * Resets a standalone drag item to its initial position.
                 * @return {?}
                 */
                CdkDrag.prototype.reset = function () {
                    this._dragRef.reset();
                };
                /**
                 * Gets the pixel coordinates of the draggable outside of a drop container.
                 * @return {?}
                 */
                CdkDrag.prototype.getFreeDragPosition = function () {
                    return this._dragRef.getFreeDragPosition();
                };
                /**
                 * @return {?}
                 */
                CdkDrag.prototype.ngAfterViewInit = function () {
                    var _this = this;
                    // We need to wait for the zone to stabilize, in order for the reference
                    // element to be in the proper place in the DOM. This is mostly relevant
                    // for draggable elements inside portals since they get stamped out in
                    // their original DOM position and then they get transferred to the portal.
                    this._ngZone.onStable.asObservable()
                        .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["take"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["takeUntil"])(this._destroyed))
                        .subscribe(( /**
                 * @return {?}
                 */function () {
                        _this._updateRootElement();
                        // Listen for any newly-added handles.
                        _this._handles.changes.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["startWith"])(_this._handles), 
                        // Sync the new handles with the DragRef.
                        Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])(( /**
                         * @param {?} handles
                         * @return {?}
                         */function (handles) {
                            /** @type {?} */
                            var childHandleElements = handles
                                .filter(( /**
                         * @param {?} handle
                         * @return {?}
                         */function (/**
                         * @param {?} handle
                         * @return {?}
                         */ handle) { return handle._parentDrag === _this; }))
                                .map(( /**
                         * @param {?} handle
                         * @return {?}
                         */function (/**
                         * @param {?} handle
                         * @return {?}
                         */ handle) { return handle.element; }));
                            _this._dragRef.withHandles(childHandleElements);
                        })), 
                        // Listen if the state of any of the handles changes.
                        Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["switchMap"])(( /**
                         * @param {?} handles
                         * @return {?}
                         */function (handles) {
                            return Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["merge"]).apply(void 0, handles.map(( /**
                             * @param {?} item
                             * @return {?}
                             */function (/**
                             * @param {?} item
                             * @return {?}
                             */ item) { return item._stateChanges; })));
                        })), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["takeUntil"])(_this._destroyed)).subscribe(( /**
                         * @param {?} handleInstance
                         * @return {?}
                         */function (/**
                         * @param {?} handleInstance
                         * @return {?}
                         */ handleInstance) {
                            // Enabled/disable the handle that changed in the DragRef.
                            /** @type {?} */
                            var dragRef = _this._dragRef;
                            /** @type {?} */
                            var handle = handleInstance.element.nativeElement;
                            handleInstance.disabled ? dragRef.disableHandle(handle) : dragRef.enableHandle(handle);
                        }));
                        if (_this.freeDragPosition) {
                            _this._dragRef.setFreeDragPosition(_this.freeDragPosition);
                        }
                    }));
                };
                /**
                 * @param {?} changes
                 * @return {?}
                 */
                CdkDrag.prototype.ngOnChanges = function (changes) {
                    /** @type {?} */
                    var rootSelectorChange = changes['rootElementSelector'];
                    /** @type {?} */
                    var positionChange = changes['freeDragPosition'];
                    // We don't have to react to the first change since it's being
                    // handled in `ngAfterViewInit` where it needs to be deferred.
                    if (rootSelectorChange && !rootSelectorChange.firstChange) {
                        this._updateRootElement();
                    }
                    // Skip the first change since it's being handled in `ngAfterViewInit`.
                    if (positionChange && !positionChange.firstChange && this.freeDragPosition) {
                        this._dragRef.setFreeDragPosition(this.freeDragPosition);
                    }
                };
                /**
                 * @return {?}
                 */
                CdkDrag.prototype.ngOnDestroy = function () {
                    this._destroyed.next();
                    this._destroyed.complete();
                    this._dragRef.dispose();
                };
                /**
                 * Syncs the root element with the `DragRef`.
                 * @private
                 * @return {?}
                 */
                CdkDrag.prototype._updateRootElement = function () {
                    /** @type {?} */
                    var element = this.element.nativeElement;
                    /** @type {?} */
                    var rootElement = this.rootElementSelector ?
                        getClosestMatchingAncestor(element, this.rootElementSelector) : element;
                    if (rootElement && rootElement.nodeType !== this._document.ELEMENT_NODE) {
                        throw Error("cdkDrag must be attached to an element node. " +
                            ("Currently attached to \"" + rootElement.nodeName + "\"."));
                    }
                    this._dragRef.withRootElement(rootElement || element);
                };
                /**
                 * Gets the boundary element, based on the `boundaryElement` value.
                 * @private
                 * @return {?}
                 */
                CdkDrag.prototype._getBoundaryElement = function () {
                    /** @type {?} */
                    var boundary = this.boundaryElement;
                    if (!boundary) {
                        return null;
                    }
                    if (typeof boundary === 'string') {
                        return getClosestMatchingAncestor(this.element.nativeElement, boundary);
                    }
                    /** @type {?} */
                    var element = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceElement"])(boundary);
                    if (Object(_angular_core__WEBPACK_IMPORTED_MODULE_4__["isDevMode"])() && !element.contains(this.element.nativeElement)) {
                        throw Error('Draggable element is not inside of the node passed into cdkDragBoundary.');
                    }
                    return element;
                };
                /**
                 * Syncs the inputs of the CdkDrag with the options of the underlying DragRef.
                 * @private
                 * @param {?} ref
                 * @return {?}
                 */
                CdkDrag.prototype._syncInputs = function (ref) {
                    var _this = this;
                    ref.beforeStarted.subscribe(( /**
                     * @return {?}
                     */function () {
                        if (!ref.isDragging()) {
                            /** @type {?} */
                            var dir = _this._dir;
                            /** @type {?} */
                            var placeholder = _this._placeholderTemplate ? {
                                template: _this._placeholderTemplate.templateRef,
                                context: _this._placeholderTemplate.data,
                                viewContainer: _this._viewContainerRef
                            } : null;
                            /** @type {?} */
                            var preview = _this._previewTemplate ? {
                                template: _this._previewTemplate.templateRef,
                                context: _this._previewTemplate.data,
                                viewContainer: _this._viewContainerRef
                            } : null;
                            ref.disabled = _this.disabled;
                            ref.lockAxis = _this.lockAxis;
                            ref.dragStartDelay = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceNumberProperty"])(_this.dragStartDelay);
                            ref.constrainPosition = _this.constrainPosition;
                            ref
                                .withBoundaryElement(_this._getBoundaryElement())
                                .withPlaceholderTemplate(placeholder)
                                .withPreviewTemplate(preview);
                            if (dir) {
                                ref.withDirection(dir.value);
                            }
                        }
                    }));
                };
                /**
                 * Handles the events from the underlying `DragRef`.
                 * @private
                 * @param {?} ref
                 * @return {?}
                 */
                CdkDrag.prototype._handleEvents = function (ref) {
                    var _this = this;
                    ref.started.subscribe(( /**
                     * @return {?}
                     */function () {
                        _this.started.emit({ source: _this });
                        // Since all of these events run outside of change detection,
                        // we need to ensure that everything is marked correctly.
                        _this._changeDetectorRef.markForCheck();
                    }));
                    ref.released.subscribe(( /**
                     * @return {?}
                     */function () {
                        _this.released.emit({ source: _this });
                    }));
                    ref.ended.subscribe(( /**
                     * @param {?} event
                     * @return {?}
                     */function (/**
                     * @param {?} event
                     * @return {?}
                     */ event) {
                        _this.ended.emit({ source: _this, distance: event.distance });
                        // Since all of these events run outside of change detection,
                        // we need to ensure that everything is marked correctly.
                        _this._changeDetectorRef.markForCheck();
                    }));
                    ref.entered.subscribe(( /**
                     * @param {?} event
                     * @return {?}
                     */function (/**
                     * @param {?} event
                     * @return {?}
                     */ event) {
                        _this.entered.emit({
                            container: event.container.data,
                            item: _this,
                            currentIndex: event.currentIndex
                        });
                    }));
                    ref.exited.subscribe(( /**
                     * @param {?} event
                     * @return {?}
                     */function (/**
                     * @param {?} event
                     * @return {?}
                     */ event) {
                        _this.exited.emit({
                            container: event.container.data,
                            item: _this
                        });
                    }));
                    ref.dropped.subscribe(( /**
                     * @param {?} event
                     * @return {?}
                     */function (/**
                     * @param {?} event
                     * @return {?}
                     */ event) {
                        _this.dropped.emit({
                            previousIndex: event.previousIndex,
                            currentIndex: event.currentIndex,
                            previousContainer: event.previousContainer.data,
                            container: event.container.data,
                            isPointerOverContainer: event.isPointerOverContainer,
                            item: _this,
                            distance: event.distance
                        });
                    }));
                };
                return CdkDrag;
            }());
            CdkDrag.decorators = [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Directive"], args: [{
                            selector: '[cdkDrag]',
                            exportAs: 'cdkDrag',
                            host: {
                                'class': 'cdk-drag',
                                '[class.cdk-drag-disabled]': 'disabled',
                                '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
                            },
                            providers: [{ provide: CDK_DRAG_PARENT, useExisting: CdkDrag }]
                        },] },
            ];
            /** @nocollapse */
            CdkDrag.ctorParameters = function () { return [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["ElementRef"] },
                { type: undefined, decorators: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Inject"], args: [CDK_DROP_LIST,] }, { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Optional"] }, { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["SkipSelf"] }] },
                { type: undefined, decorators: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Inject"], args: [_angular_common__WEBPACK_IMPORTED_MODULE_5__["DOCUMENT"],] }] },
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["NgZone"] },
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["ViewContainerRef"] },
                { type: undefined, decorators: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Inject"], args: [CDK_DRAG_CONFIG,] }] },
                { type: _angular_cdk_bidi__WEBPACK_IMPORTED_MODULE_7__["Directionality"], decorators: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Optional"] }] },
                { type: DragDrop },
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["ChangeDetectorRef"] }
            ]; };
            CdkDrag.propDecorators = {
                _handles: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["ContentChildren"], args: [CdkDragHandle, { descendants: true },] }],
                _previewTemplate: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["ContentChild"], args: [CdkDragPreview, { static: false },] }],
                _placeholderTemplate: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["ContentChild"], args: [CdkDragPlaceholder, { static: false },] }],
                data: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDragData',] }],
                lockAxis: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDragLockAxis',] }],
                rootElementSelector: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDragRootElement',] }],
                boundaryElement: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDragBoundary',] }],
                dragStartDelay: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDragStartDelay',] }],
                freeDragPosition: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDragFreeDragPosition',] }],
                disabled: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDragDisabled',] }],
                constrainPosition: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDragConstrainPosition',] }],
                started: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Output"], args: ['cdkDragStarted',] }],
                released: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Output"], args: ['cdkDragReleased',] }],
                ended: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Output"], args: ['cdkDragEnded',] }],
                entered: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Output"], args: ['cdkDragEntered',] }],
                exited: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Output"], args: ['cdkDragExited',] }],
                dropped: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Output"], args: ['cdkDragDropped',] }],
                moved: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Output"], args: ['cdkDragMoved',] }]
            };
            /**
             * Gets the closest ancestor of an element that matches a selector.
             * @param {?} element
             * @param {?} selector
             * @return {?}
             */
            function getClosestMatchingAncestor(element, selector) {
                /** @type {?} */
                var currentElement = ( /** @type {?} */(element.parentElement));
                while (currentElement) {
                    // IE doesn't support `matches` so we have to fall back to `msMatchesSelector`.
                    if (currentElement.matches ? currentElement.matches(selector) :
                        (( /** @type {?} */(currentElement))).msMatchesSelector(selector)) {
                        return currentElement;
                    }
                    currentElement = currentElement.parentElement;
                }
                return null;
            }
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Declaratively connects sibling `cdkDropList` instances together. All of the `cdkDropList`
             * elements that are placed inside a `cdkDropListGroup` will be connected to each other
             * automatically. Can be used as an alternative to the `cdkDropListConnectedTo` input
             * from `cdkDropList`.
             * @template T
             */
            var CdkDropListGroup = /** @class */ (function () {
                function CdkDropListGroup() {
                    /**
                     * Drop lists registered inside the group.
                     */
                    this._items = new Set();
                    this._disabled = false;
                }
                Object.defineProperty(CdkDropListGroup.prototype, "disabled", {
                    /**
                     * Whether starting a dragging sequence from inside this group is disabled.
                     * @return {?}
                     */
                    get: function () { return this._disabled; },
                    /**
                     * @param {?} value
                     * @return {?}
                     */
                    set: function (value) {
                        this._disabled = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceBooleanProperty"])(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * @return {?}
                 */
                CdkDropListGroup.prototype.ngOnDestroy = function () {
                    this._items.clear();
                };
                return CdkDropListGroup;
            }());
            CdkDropListGroup.decorators = [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Directive"], args: [{
                            selector: '[cdkDropListGroup]',
                            exportAs: 'cdkDropListGroup',
                        },] },
            ];
            CdkDropListGroup.propDecorators = {
                disabled: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDropListGroupDisabled',] }]
            };
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * Counter used to generate unique ids for drop zones.
             * @type {?}
             */
            var _uniqueIdCounter$1 = 0;
            var ɵ0 = undefined;
            // @breaking-change 8.0.0 `CdkDropList` implements `CdkDropListContainer` for backwards
            // compatiblity. The implements clause, as well as all the methods that it enforces can
            // be removed when `CdkDropListContainer` is deleted.
            /**
             * Container that wraps a set of draggable items.
             * @template T
             */
            var CdkDropList = /** @class */ (function () {
                /**
                 * @param {?} element
                 * @param {?} dragDrop
                 * @param {?} _changeDetectorRef
                 * @param {?=} _dir
                 * @param {?=} _group
                 */
                function CdkDropList(element, dragDrop, _changeDetectorRef, _dir, _group) {
                    var _this = this;
                    this.element = element;
                    this._changeDetectorRef = _changeDetectorRef;
                    this._dir = _dir;
                    this._group = _group;
                    /**
                     * Emits when the list has been destroyed.
                     */
                    this._destroyed = new rxjs__WEBPACK_IMPORTED_MODULE_2__["Subject"]();
                    /**
                     * Other draggable containers that this container is connected to and into which the
                     * container's items can be transferred. Can either be references to other drop containers,
                     * or their unique IDs.
                     */
                    this.connectedTo = [];
                    /**
                     * Direction in which the list is oriented.
                     */
                    this.orientation = 'vertical';
                    /**
                     * Unique ID for the drop zone. Can be used as a reference
                     * in the `connectedTo` of another `CdkDropList`.
                     */
                    this.id = "cdk-drop-list-" + _uniqueIdCounter$1++;
                    this._disabled = false;
                    this._sortingDisabled = false;
                    /**
                     * Function that is used to determine whether an item
                     * is allowed to be moved into a drop container.
                     */
                    this.enterPredicate = ( /**
                     * @return {?}
                     */function () { return true; });
                    /**
                     * Whether to auto-scroll the view when the user moves their pointer close to the edges.
                     */
                    this.autoScrollDisabled = false;
                    /**
                     * Emits when the user drops an item inside the container.
                     */
                    this.dropped = new _angular_core__WEBPACK_IMPORTED_MODULE_4__["EventEmitter"]();
                    /**
                     * Emits when the user has moved a new drag item into this container.
                     */
                    this.entered = new _angular_core__WEBPACK_IMPORTED_MODULE_4__["EventEmitter"]();
                    /**
                     * Emits when the user removes an item from the container
                     * by dragging it into another container.
                     */
                    this.exited = new _angular_core__WEBPACK_IMPORTED_MODULE_4__["EventEmitter"]();
                    /**
                     * Emits as the user is swapping items while actively dragging.
                     */
                    this.sorted = new _angular_core__WEBPACK_IMPORTED_MODULE_4__["EventEmitter"]();
                    this._dropListRef = dragDrop.createDropList(element);
                    this._dropListRef.data = this;
                    this._dropListRef.enterPredicate = ( /**
                     * @param {?} drag
                     * @param {?} drop
                     * @return {?}
                     */function (drag, drop) {
                        return _this.enterPredicate(drag.data, drop.data);
                    });
                    this._syncInputs(this._dropListRef);
                    this._handleEvents(this._dropListRef);
                    CdkDropList._dropLists.push(this);
                    if (_group) {
                        _group._items.add(this);
                    }
                }
                Object.defineProperty(CdkDropList.prototype, "disabled", {
                    /**
                     * Whether starting a dragging sequence from this container is disabled.
                     * @return {?}
                     */
                    get: function () {
                        return this._disabled || (!!this._group && this._group.disabled);
                    },
                    /**
                     * @param {?} value
                     * @return {?}
                     */
                    set: function (value) {
                        this._disabled = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceBooleanProperty"])(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(CdkDropList.prototype, "sortingDisabled", {
                    /**
                     * Whether sorting within this drop list is disabled.
                     * @return {?}
                     */
                    get: function () { return this._sortingDisabled; },
                    /**
                     * @param {?} value
                     * @return {?}
                     */
                    set: function (value) {
                        this._sortingDisabled = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceBooleanProperty"])(value);
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * @return {?}
                 */
                CdkDropList.prototype.ngAfterContentInit = function () {
                    var _this = this;
                    this._draggables.changes
                        .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["startWith"])(this._draggables), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["takeUntil"])(this._destroyed))
                        .subscribe(( /**
                 * @param {?} items
                 * @return {?}
                 */function (items) {
                        _this._dropListRef.withItems(items.map(( /**
                         * @param {?} drag
                         * @return {?}
                         */function (/**
                         * @param {?} drag
                         * @return {?}
                         */ drag) { return drag._dragRef; })));
                    }));
                };
                /**
                 * @return {?}
                 */
                CdkDropList.prototype.ngOnDestroy = function () {
                    /** @type {?} */
                    var index = CdkDropList._dropLists.indexOf(this);
                    if (index > -1) {
                        CdkDropList._dropLists.splice(index, 1);
                    }
                    if (this._group) {
                        this._group._items.delete(this);
                    }
                    this._dropListRef.dispose();
                    this._destroyed.next();
                    this._destroyed.complete();
                };
                /**
                 * Starts dragging an item.
                 * @return {?}
                 */
                CdkDropList.prototype.start = function () {
                    this._dropListRef.start();
                };
                /**
                 * Drops an item into this container.
                 * @param {?} item Item being dropped into the container.
                 * @param {?} currentIndex Index at which the item should be inserted.
                 * @param {?} previousContainer Container from which the item got dragged in.
                 * @param {?} isPointerOverContainer Whether the user's pointer was over the
                 *    container when the item was dropped.
                 * @return {?}
                 */
                CdkDropList.prototype.drop = function (item, currentIndex, previousContainer, isPointerOverContainer) {
                    this._dropListRef.drop(item._dragRef, currentIndex, (( /** @type {?} */(previousContainer)))._dropListRef, isPointerOverContainer);
                };
                /**
                 * Emits an event to indicate that the user moved an item into the container.
                 * @param {?} item Item that was moved into the container.
                 * @param {?} pointerX Position of the item along the X axis.
                 * @param {?} pointerY Position of the item along the Y axis.
                 * @return {?}
                 */
                CdkDropList.prototype.enter = function (item, pointerX, pointerY) {
                    this._dropListRef.enter(item._dragRef, pointerX, pointerY);
                };
                /**
                 * Removes an item from the container after it was dragged into another container by the user.
                 * @param {?} item Item that was dragged out.
                 * @return {?}
                 */
                CdkDropList.prototype.exit = function (item) {
                    this._dropListRef.exit(item._dragRef);
                };
                /**
                 * Figures out the index of an item in the container.
                 * @param {?} item Item whose index should be determined.
                 * @return {?}
                 */
                CdkDropList.prototype.getItemIndex = function (item) {
                    return this._dropListRef.getItemIndex(item._dragRef);
                };
                /**
                 * Sorts an item inside the container based on its position.
                 * @param {?} item Item to be sorted.
                 * @param {?} pointerX Position of the item along the X axis.
                 * @param {?} pointerY Position of the item along the Y axis.
                 * @param {?} pointerDelta Direction in which the pointer is moving along each axis.
                 * @return {?}
                 */
                CdkDropList.prototype._sortItem = function (item, pointerX, pointerY, pointerDelta) {
                    return this._dropListRef._sortItem(item._dragRef, pointerX, pointerY, pointerDelta);
                };
                /**
                 * Figures out whether an item should be moved into a sibling
                 * drop container, based on its current position.
                 * @param {?} item Drag item that is being moved.
                 * @param {?} x Position of the item along the X axis.
                 * @param {?} y Position of the item along the Y axis.
                 * @return {?}
                 */
                CdkDropList.prototype._getSiblingContainerFromPosition = function (item, x, y) {
                    /** @type {?} */
                    var result = this._dropListRef._getSiblingContainerFromPosition(item._dragRef, x, y);
                    return result ? result.data : null;
                };
                /**
                 * Checks whether the user's pointer is positioned over the container.
                 * @param {?} x Pointer position along the X axis.
                 * @param {?} y Pointer position along the Y axis.
                 * @return {?}
                 */
                CdkDropList.prototype._isOverContainer = function (x, y) {
                    return this._dropListRef._isOverContainer(x, y);
                };
                /**
                 * Syncs the inputs of the CdkDropList with the options of the underlying DropListRef.
                 * @private
                 * @param {?} ref
                 * @return {?}
                 */
                CdkDropList.prototype._syncInputs = function (ref) {
                    var _this = this;
                    if (this._dir) {
                        this._dir.change
                            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["startWith"])(this._dir.value), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["takeUntil"])(this._destroyed))
                            .subscribe(( /**
                     * @param {?} value
                     * @return {?}
                     */function (/**
                     * @param {?} value
                     * @return {?}
                     */ value) { return ref.withDirection(value); }));
                    }
                    ref.beforeStarted.subscribe(( /**
                     * @return {?}
                     */function () {
                        /** @type {?} */
                        var siblings = Object(_angular_cdk_coercion__WEBPACK_IMPORTED_MODULE_1__["coerceArray"])(_this.connectedTo).map(( /**
                         * @param {?} drop
                         * @return {?}
                         */function (/**
                         * @param {?} drop
                         * @return {?}
                         */ drop) {
                            return typeof drop === 'string' ?
                                ( /** @type {?} */(CdkDropList._dropLists.find(( /**
                                 * @param {?} list
                                 * @return {?}
                                 */function (/**
                                 * @param {?} list
                                 * @return {?}
                                 */ list) { return list.id === drop; })))) : drop;
                        }));
                        if (_this._group) {
                            _this._group._items.forEach(( /**
                             * @param {?} drop
                             * @return {?}
                             */function (/**
                             * @param {?} drop
                             * @return {?}
                             */ drop) {
                                if (siblings.indexOf(drop) === -1) {
                                    siblings.push(drop);
                                }
                            }));
                        }
                        ref.disabled = _this.disabled;
                        ref.lockAxis = _this.lockAxis;
                        ref.sortingDisabled = _this.sortingDisabled;
                        ref.autoScrollDisabled = _this.autoScrollDisabled;
                        ref
                            .connectedTo(siblings.filter(( /**
                     * @param {?} drop
                     * @return {?}
                     */function (/**
                     * @param {?} drop
                     * @return {?}
                     */ drop) { return drop && drop !== _this; })).map(( /**
                         * @param {?} list
                         * @return {?}
                         */function (/**
                         * @param {?} list
                         * @return {?}
                         */ list) { return list._dropListRef; })))
                            .withOrientation(_this.orientation);
                    }));
                };
                /**
                 * Handles events from the underlying DropListRef.
                 * @private
                 * @param {?} ref
                 * @return {?}
                 */
                CdkDropList.prototype._handleEvents = function (ref) {
                    var _this = this;
                    ref.beforeStarted.subscribe(( /**
                     * @return {?}
                     */function () {
                        _this._changeDetectorRef.markForCheck();
                    }));
                    ref.entered.subscribe(( /**
                     * @param {?} event
                     * @return {?}
                     */function (/**
                     * @param {?} event
                     * @return {?}
                     */ event) {
                        _this.entered.emit({
                            container: _this,
                            item: event.item.data,
                            currentIndex: event.currentIndex
                        });
                    }));
                    ref.exited.subscribe(( /**
                     * @param {?} event
                     * @return {?}
                     */function (/**
                     * @param {?} event
                     * @return {?}
                     */ event) {
                        _this.exited.emit({
                            container: _this,
                            item: event.item.data
                        });
                        _this._changeDetectorRef.markForCheck();
                    }));
                    ref.sorted.subscribe(( /**
                     * @param {?} event
                     * @return {?}
                     */function (/**
                     * @param {?} event
                     * @return {?}
                     */ event) {
                        _this.sorted.emit({
                            previousIndex: event.previousIndex,
                            currentIndex: event.currentIndex,
                            container: _this,
                            item: event.item.data
                        });
                    }));
                    ref.dropped.subscribe(( /**
                     * @param {?} event
                     * @return {?}
                     */function (/**
                     * @param {?} event
                     * @return {?}
                     */ event) {
                        _this.dropped.emit({
                            previousIndex: event.previousIndex,
                            currentIndex: event.currentIndex,
                            previousContainer: event.previousContainer.data,
                            container: event.container.data,
                            item: event.item.data,
                            isPointerOverContainer: event.isPointerOverContainer,
                            distance: event.distance
                        });
                        // Mark for check since all of these events run outside of change
                        // detection and we're not guaranteed for something else to have triggered it.
                        _this._changeDetectorRef.markForCheck();
                    }));
                };
                return CdkDropList;
            }());
            /**
             * Keeps track of the drop lists that are currently on the page.
             */
            CdkDropList._dropLists = [];
            CdkDropList.decorators = [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Directive"], args: [{
                            selector: '[cdkDropList], cdk-drop-list',
                            exportAs: 'cdkDropList',
                            providers: [
                                // Prevent child drop lists from picking up the same group as their parent.
                                { provide: CdkDropListGroup, useValue: ɵ0 },
                                { provide: CDK_DROP_LIST_CONTAINER, useExisting: CdkDropList },
                            ],
                            host: {
                                'class': 'cdk-drop-list',
                                '[id]': 'id',
                                '[class.cdk-drop-list-disabled]': 'disabled',
                                '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
                                '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
                            }
                        },] },
            ];
            /** @nocollapse */
            CdkDropList.ctorParameters = function () { return [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["ElementRef"] },
                { type: DragDrop },
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["ChangeDetectorRef"] },
                { type: _angular_cdk_bidi__WEBPACK_IMPORTED_MODULE_7__["Directionality"], decorators: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Optional"] }] },
                { type: CdkDropListGroup, decorators: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Optional"] }, { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["SkipSelf"] }] }
            ]; };
            CdkDropList.propDecorators = {
                _draggables: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["ContentChildren"], args: [Object(_angular_core__WEBPACK_IMPORTED_MODULE_4__["forwardRef"])(( /**
                                         * @return {?}
                                         */function () { return CdkDrag; })), {
                                // Explicitly set to false since some of the logic below makes assumptions about it.
                                // The `.withItems` call below should be updated if we ever need to switch this to `true`.
                                descendants: false
                            },] }],
                connectedTo: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDropListConnectedTo',] }],
                data: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDropListData',] }],
                orientation: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDropListOrientation',] }],
                id: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"] }],
                lockAxis: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDropListLockAxis',] }],
                disabled: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDropListDisabled',] }],
                sortingDisabled: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDropListSortingDisabled',] }],
                enterPredicate: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDropListEnterPredicate',] }],
                autoScrollDisabled: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Input"], args: ['cdkDropListAutoScrollDisabled',] }],
                dropped: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Output"], args: ['cdkDropListDropped',] }],
                entered: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Output"], args: ['cdkDropListEntered',] }],
                exited: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Output"], args: ['cdkDropListExited',] }],
                sorted: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["Output"], args: ['cdkDropListSorted',] }]
            };
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            var DragDropModule = /** @class */ (function () {
                function DragDropModule() {
                }
                return DragDropModule;
            }());
            DragDropModule.decorators = [
                { type: _angular_core__WEBPACK_IMPORTED_MODULE_4__["NgModule"], args: [{
                            declarations: [
                                CdkDropList,
                                CdkDropListGroup,
                                CdkDrag,
                                CdkDragHandle,
                                CdkDragPreview,
                                CdkDragPlaceholder,
                            ],
                            exports: [
                                CdkDropList,
                                CdkDropListGroup,
                                CdkDrag,
                                CdkDragHandle,
                                CdkDragPreview,
                                CdkDragPlaceholder,
                            ],
                            providers: [
                                DragDrop,
                            ]
                        },] },
            ];
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            /**
             * @fileoverview added by tsickle
             * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
             */
            //# sourceMappingURL=drag-drop.js.map
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/abrir-mesa/abrir-mesa.component.html": 
        /*!*******************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/abrir-mesa/abrir-mesa.component.html ***!
          \*******************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<h1 mat-dialog-title>Abrir mesa</h1>\n<div mat-dialog-content>\n    <form #frmAbrirMesa=\"ngForm\" (ngSubmit)=\"frmAbrirMesa.form.valid\" novalidate>\n        <mat-form-field>\n            <!--<input type=\"text\" matInput [matKeyboard]=\"'es'\" darkTheme=\"true\" cdkFocusInitial placeholder=\"Mesero\" name=\"mesero\" [(ngModel)]=\"data.mesero\" required>-->\n            <mat-label>Mesero</mat-label>\n            <mat-select name=\"mesero\" [(ngModel)]=\"data.mesero\">\n                <mat-option *ngFor=\"let usr of lstMeseros\" [value]=\"usr.usuario\">\n                    {{usr.nombres}} {{usr.apellidos}}\n                </mat-option>\n            </mat-select>\n        </mat-form-field>&nbsp;&nbsp;&nbsp;&nbsp;\n        <mat-form-field *ngIf=\"!esMovil\">\n            <input type=\"text\" matInput ng-virtual-keyboard ng-virtual-keyboard-layout=\"numeric\"\n                ng-virtual-keyboard-placeholder=\"# Comensales\" placeholder=\"# Comensales\" name=\"comensales\"\n                [(ngModel)]=\"data.comensales\" required>\n        </mat-form-field>\n        <mat-form-field *ngIf=\"esMovil\">\n            <input type=\"text\" matInput placeholder=\"# Comensales\" name=\"comensales\" [(ngModel)]=\"data.comensales\"\n                required>\n        </mat-form-field>\n        <mat-checkbox name=\"esEvento\" [(ngModel)]=\"+data.esEvento\">¿Es evento?</mat-checkbox>&nbsp;&nbsp;&nbsp;&nbsp;\n        <mat-checkbox name=\"dividirCuentasPorSillas\" [(ngModel)]=\"+data.dividirCuentasPorSillas\"\n            [disabled]=\"+data.comensales <= 1\">¿Dividir cuentas?</mat-checkbox>\n    </form>\n</div>\n<div align=\"end\">\n    <button mat-icon-button (click)=\"terminar()\" color=\"warn\">\n        <mat-icon>cancel_presentation</mat-icon>\n    </button>\n    <button mat-icon-button (click)=\"terminar(data)\" [disabled]=\"!frmAbrirMesa.form.valid\" color=\"accent\">\n        <mat-icon>check_circle</mat-icon>\n    </button>\n</div>");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/area/area-designer/area-designer.component.html": 
        /*!******************************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/area/area-designer/area-designer.component.html ***!
          \******************************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<div class=\"diseniador\">\n    <div style=\"height: 50px;\" align=\"center\">\n        <button mat-flat-button type=\"button\" color=\"accent\" (click)=\"addTable()\">\n            Agregar mesa\n        </button>\n        <button mat-flat-button type=\"button\" color=\"accent\" (click)=\"terminar()\">\n            Terminar\n        </button>\n    </div>\n    <div id=\"divAreaPosicionamiento\" class=\"areaPosicionamiento\">\n        <app-mesa *ngFor=\"let m of mesas\" [configuracion]=\"m\" (onClickMesa)=\"onClickMesa($event)\" [dontAllowDrag]=\"false\"></app-mesa>\n    </div>\n</div>");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/area/area/area.component.html": 
        /*!************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/area/area/area.component.html ***!
          \************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<div class=\"row\">\n    <div class=\"col m5 s12\">\n        <app-lista-area #listaAreas (getEntidadEv)=\"setArea($event)\"></app-lista-area>\n    </div>\n    <div class=\"col m7 s12\">\n        <app-form-area [entidad]=\"area\" (entidadSavedEv)=\"refreshAreaList()\"></app-form-area>\n    </div>\n</div>");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/area/form-area/form-area.component.html": 
        /*!**********************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/area/form-area/form-area.component.html ***!
          \**********************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<mat-card class=\"mat-elevation-z4 fullWidth\">\n    <mat-card-title>\n        <h4>Área</h4>\n    </mat-card-title>\n    <mat-card-content>\n        <form #frmEntidad=\"ngForm\" (ngSubmit)=\"frmEntidad.form.valid && onSubmit()\" novalidate>\n            <mat-form-field class=\"fullWidth\" *ngIf=\"esMovil\">\n                <input type=\"text\" matInput placeholder=\"Nombre\" name=\"nombre\" [(ngModel)]=\"entidad.nombre\" required>\n            </mat-form-field>\n            <mat-form-field class=\"fullWidth\" *ngIf=\"!esMovil\">\n                <input type=\"text\" matInput ng-virtual-keyboard ng-virtual-keyboard-layout=\"alphanumeric\"\n                    ng-virtual-keyboard-placeholder=\"Nombre\" placeholder=\"Nombre\" name=\"nombre\"\n                    [(ngModel)]=\"entidad.nombre\" required>\n            </mat-form-field>\n            <mat-form-field class=\"fullWidth\">\n                <mat-label>Área padre</mat-label>\n                <mat-select name=\"area_padre\" [(ngModel)]=\"entidad.area_padre\">\n                    <mat-option *ngFor=\"let ar of lstAreas\" [value]=\"ar.area\">\n                        {{ar.nombre}}\n                    </mat-option>\n                </mat-select>\n            </mat-form-field>\n            <h5>Mesas en el área: {{entidad.mesas.length}}</h5>\n            <div align=\"end\">\n                <button mat-icon-button type=\"submit\" color=\"accent\" [disabled]=\"!frmEntidad.form.valid\">\n                    <mat-icon>save</mat-icon>\n                </button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n                <button mat-flat-button type=\"button\" color=\"accent\" (click)=\"openDesigner()\" *ngIf=\"entidad.area\">\n                    Diseñar\n                </button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n                <button mat-icon-button type=\"button\" color=\"accent\" (click)=\"resetEntidad()\" *ngIf=\"entidad.area\">\n                    <mat-icon>add</mat-icon>\n                </button>\n            </div>\n        </form>\n    </mat-card-content>\n</mat-card>");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/area/lista-area/lista-area.component.html": 
        /*!************************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/area/lista-area/lista-area.component.html ***!
          \************************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<mat-card class=\"mat-elevation-z4 fullWidth\">\n    <mat-card-content>\n        <mat-form-field>\n            <input matInput (keyup)=\"applyFilter($event.target.value)\" placeholder=\"Buscar...\">\n        </mat-form-field>\n        <table mat-table [dataSource]=\"dataSource\">\n            <ng-container matColumnDef=\"nombre\">\n                <!--<th mat-header-cell *matHeaderCellDef> No. </th>-->\n                <td mat-cell *matCellDef=\"let element\" (click)=\"getEntidad(element.area)\">\n                    <mat-list>\n                        <mat-list-item>\n                            <mat-icon mat-list-icon>settings</mat-icon>\n                            <h5 mat-line>{{element.nombre}}</h5>\n                            <button mat-icon-button type=\"button\" color=\"accent\">\n                                <mat-icon>arrow_right_alt</mat-icon>\n                            </button>\n                        </mat-list-item>\n                    </mat-list>\n                </td>\n            </ng-container>\n            <!--<tr mat-header-row *matHeaderRowDef=\"displayedColumns\"></tr>-->\n            <tr mat-row *matRowDef=\"let row; columns: displayedColumns;\"></tr>\n        </table>\n        <mat-paginator [pageSizeOptions]=\"[5, 10, 20]\" showFirstLastButtons></mat-paginator>\n    </mat-card-content>\n</mat-card>");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/lista-productos-comanda/lista-productos-comanda.component.html": 
        /*!*********************************************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/lista-productos-comanda/lista-productos-comanda.component.html ***!
          \*********************************************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<mat-list class=\"fullWidth\" [style.height]=\"listHeight\">\n    <mat-list-item *ngFor=\"let p of listaProductos; let i = index;\" [ngClass]=\"{'noImpreso': +p.impreso === 0}\"\n        [style.height]=\"p.itemListHeight\">\n        <div matLine class=\"fullWidth\">\n            <div class=\"row\">\n                <div class=\"col m6 s12\">\n                    <span>{{p.cantidad}}&nbsp;{{p.nombre}}</span>\n                </div>\n                <div class=\"col m6 s12\" align=\"end\">\n                    <!--<span class=\"spacer\"></span>-->\n                    <span>{{(p.cantidad * p.precio) | number: '1.2-2'}}</span>&nbsp;\n                    <eco-fab-speed-dial direction=\"left\" *ngIf=\"!p.impreso\">\n                        <eco-fab-speed-dial-trigger>\n                            <button mat-fab>\n                                <mat-icon style=\"font-size: 18pt !important;\">keyboard_arrow_left</mat-icon>\n                            </button>\n                        </eco-fab-speed-dial-trigger>\n                        <eco-fab-speed-dial-actions>\n                            <button mat-mini-fab (click)=\"deleteProductoFromList(i)\" color=\"warn\">\n                                <mat-icon style=\"font-size: 16pt !important;\">delete_forever</mat-icon>\n                            </button>\n                            <button mat-mini-fab (click)=\"removeProducto(p, i)\" color=\"warn\">\n                                <mat-icon style=\"font-size: 16pt !important;\">remove_circle</mat-icon>\n                            </button>\n                            <button mat-mini-fab (click)=\"toggleShowInputNotas(p)\" color=\"accent\">\n                                <mat-icon style=\"font-size: 16pt !important;\">notes</mat-icon>\n                            </button>\n                        </eco-fab-speed-dial-actions>\n                    </eco-fab-speed-dial>\n                </div>\n            </div>\n        </div>\n        <div matLine class=\"fullWidth\">\n            <mat-form-field class=\"fullWidth\" *ngIf=\"p.showInputNotas && esMovil\">\n                <input matInput placeholder=\"Notas de producto\" [(ngModel)]=\"p.notas\"\n                    (keyup.enter)=\"toggleShowInputNotas(p)\">\n            </mat-form-field>\n            <mat-form-field class=\"fullWidth\" *ngIf=\"p.showInputNotas && !esMovil\">\n                <input matInput ng-virtual-keyboard ng-virtual-keyboard-layout=\"alphanumeric\"\n                    ng-virtual-keyboard-placeholder=\"Notas de producto\" placeholder=\"Notas de producto\"\n                    [(ngModel)]=\"p.notas\" (keyup.enter)=\"toggleShowInputNotas(p)\">\n            </mat-form-field>\n        </div>\n    </mat-list-item>\n</mat-list>");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/mesa/mesa.component.html": 
        /*!*******************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/mesa/mesa.component.html ***!
          \*******************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<div #divMesa cdkDrag (cdkDragEnded)=\"dragEnded($event)\" cdkDragBoundary=\".areaPosicionamiento\" [cdkDragDisabled]=\"dontAllowDrag\" class=\"divMesa mat-elevation-z6\" \n    [ngClass]=\"{'disponible': +configuracion.estatus == 1, 'ocupada': +configuracion.estatus == 2}\"\n    (click)=\"clickMesa()\"\n    [style.width.px]=\"configuracion.tamanio\" \n    [style.height.px]=\"configuracion.tamanio\" \n    [style.left.%]=\"configuracion.posx\" \n    [style.top.%]=\"configuracion.posy\">\n    <span>{{configuracion.numero}}</span>\n</div>");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/pide-datos-cuentas/pide-datos-cuentas.component.html": 
        /*!***********************************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/pide-datos-cuentas/pide-datos-cuentas.component.html ***!
          \***********************************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<h1 mat-dialog-title>Ingreso de datos de cuentas</h1>\n<div mat-dialog-content>\n    <table #tblCuentas mat-table [dataSource]=\"dataSource\" class=\"fullWidth\">\n        <ng-container matColumnDef=\"numero\">\n            <th mat-header-cell *matHeaderCellDef>No.</th>\n            <td mat-cell *matCellDef=\"let element\">\n                <span>{{element.numero}}</span>\n            </td>\n        </ng-container>\n        <ng-container matColumnDef=\"nombre\">\n            <th mat-header-cell *matHeaderCellDef>Nombre</th>\n            <td mat-cell *matCellDef=\"let element\">\n                <mat-form-field class=\"fullWidth\" *ngIf=\"esMovil\">\n                    <input type=\"text\" matInput name=\"nombre\" [(ngModel)]=\"element.nombre\" required>\n                </mat-form-field>\n                <mat-form-field class=\"fullWidth\" *ngIf=\"!esMovil\">\n                    <input type=\"text\" matInput ng-virtual-keyboard ng-virtual-keyboard-layout=\"alphanumeric\" ng-virtual-keyboard-placeholder=\"Nombre\" name=\"nombre\" [(ngModel)]=\"element.nombre\" required>\n                </mat-form-field>\n            </td>\n        </ng-container>\n        <tr mat-header-row *matHeaderRowDef=\"displayedColumns\"></tr>\n        <tr mat-row *matRowDef=\"let row; columns: displayedColumns;\"></tr>\n    </table>\n</div>\n<div mat-dialog-actions class=\"d-flex justify-content-end\">\n    <button mat-icon-button (click)=\"agregarFila()\" color=\"accent\">\n        <mat-icon>add</mat-icon>\n    </button>\n    <button mat-icon-button (click)=\"terminar(data)\" color=\"accent\">\n        <mat-icon>check_circle</mat-icon>\n    </button>\n</div>");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/propinas/propinas.component.html": 
        /*!************************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/propinas/propinas.component.html ***!
          \************************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<div class=\"row\">\n    <div class=\"col m12 s12\">\n        <mat-card class=\"mat-elevation-z4 fullWidth\">\n            <mat-card-title>\n                <h4>Reporte de Propinas</h4>\n            </mat-card-title>\n            <mat-card-content>\n                <form #frmEntidad=\"ngForm\" novalidate>\n                    <app-rpt-fechas [(fdel)]=\"params.fdel\" [(fal)]=\"params.fal\" [configuracion]=\"configParams\"></app-rpt-fechas>\n                    <app-rpt-botones\n                        [configuracion]=\"configBotones\"\n                        (htmlClick)=\"getReporte()\"\n                        (pdfClick)=\"getReporte()\"\n                        (excelClick)=\"getReporte()\"\n                        (resetParamsClick)=\"resetParams()\">\n                    </app-rpt-botones>\n                </form>\n            </mat-card-content>\n        </mat-card>                \n    </div>\n</div>\n\n");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/rpt-ventas/por-articulo/por-articulo.component.html": 
        /*!*******************************************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/rpt-ventas/por-articulo/por-articulo.component.html ***!
          \*******************************************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<mat-card class=\"mat-elevation-z4 fullWidth\">\n    <mat-card-header>\n        <mat-card-title>Reporte de ventas</mat-card-title>\n        <mat-card-subtitle>\n            Por artículo<br />\n            Del {{params.fdel | date:'dd/MM/yyyy'}} al {{params.fal | date:'dd/MM/yyyy'}}\n        </mat-card-subtitle>\n    </mat-card-header>\n    <mat-card-content>\n        <table class=\"tbl\">\n            <thead>\n                <tr>\n                    <th class=\"brdTSingleBSingle\">Descripción</th>\n                    <th class=\"rtxt numWidth brdTSingleBSingle\">Cantidad</th>\n                    <th class=\"rtxt numWidth brdTSingleBSingle\">Total</th>\n                </tr>\n            </thead>\n            <tbody>\n                <ng-container *ngFor=\"let art of data\">\n                    <tr>\n                        <td class=\"doubleTab brdBSingle\">{{art.articulo.descripcion}}</td>\n                        <td class=\"rtxt numWidth brdBSingle\">{{art.cantidad | number:'1.2-2'}}</td>\n                        <td class=\"rtxt numWidth brdBSingle\">{{art.total | number:'1.2-2'}}</td>\n                    </tr>\n                </ng-container>\n            </tbody>\n        </table>\n    </mat-card-content>\n    <!--\n    <mat-card-footer>\n    </mat-card-footer>\n    -->\n</mat-card>");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/rpt-ventas/por-categoria/por-categoria.component.html": 
        /*!*********************************************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/rpt-ventas/por-categoria/por-categoria.component.html ***!
          \*********************************************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<mat-card class=\"mat-elevation-z4 fullWidth\">\n    <mat-card-header>\n        <mat-card-title>Reporte de ventas</mat-card-title>\n        <mat-card-subtitle>\n            Por categoría<br />\n            Del {{params.fdel | date:'dd/MM/yyyy'}} al {{params.fal | date:'dd/MM/yyyy'}}\n        </mat-card-subtitle>\n    </mat-card-header>\n    <mat-card-content>\n        <table class=\"tbl\">\n            <thead>\n                <tr>\n                    <th class=\"brdTSingleBSingle\">Descripción</th>\n                    <th class=\"rtxt numWidth brdTSingleBSingle\">Cantidad</th>\n                    <th class=\"rtxt numWidth brdTSingleBSingle\">Porcentaje</th>\n                    <th class=\"rtxt numWidth brdTSingleBSingle\">Precio unitario</th>\n                    <th class=\"rtxt numWidth brdTSingleBSingle\">Total</th>\n                </tr>\n            </thead>\n            <tbody>\n                <ng-container *ngFor=\"let cat of data\">\n                    <ng-container *ngIf=\"cat.subcategoria.length > 0\">\n                        <tr>\n                            <th colspan=\"5\">{{cat.descripcion}}</th>\n                        </tr>\n                        <!-- Inicio de contenedor de subcategorias -->\n                        <ng-container *ngFor=\"let subcat of cat.subcategoria\">\n                            <ng-container *ngIf=\"subcat.articulos.length > 0\">\n                                <tr>\n                                    <th class=\"tab\" colspan=\"5\">{{subcat.descripcion}}</th>\n                                </tr>\n                                <!-- Inicio de contenedor de artículos -->\n                                <ng-container *ngFor=\"let art of subcat.articulos\">\n                                    <tr>\n                                        <td class=\"doubleTab brdBSingle\">{{art.descripcion}}</td>\n                                        <td class=\"rtxt numWidth brdBSingle\">{{art.cantidad | number:'1.2-2'}}</td>\n                                        <td class=\"rtxt numWidth brdBSingle\">{{art.porcentaje | number:'1.2-2'}}</td>\n                                        <td class=\"rtxt numWidth brdBSingle\">{{art.precio_unitario | number:'1.2-2'}}</td>\n                                        <td class=\"rtxt numWidth brdBSingle\">{{art.total | number:'1.2-2'}}</td>\n                                    </tr>\n                                </ng-container>\n                                <!-- Fin de contenedor de artículos -->\n                                <tr>\n                                    <th class=\"rtxt\" colspan=\"4\">Total de subcategoría:</th>\n                                    <th class=\"rtxt brdTSingleBDouble numWidth\">{{subcat.total | number:'1.2-2'}}</th>\n                                </tr>\n                            </ng-container>\n                        </ng-container>\n                        <!-- Fin de contenedor de subcategorias -->\n                    </ng-container>\n                </ng-container>\n            </tbody>\n        </table>\n    </mat-card-content>\n    <!--\n    <mat-card-footer>\n    </mat-card-footer>\n    -->\n</mat-card>");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/rpt-ventas/rpt-ventas.component.html": 
        /*!****************************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/rpt-ventas/rpt-ventas.component.html ***!
          \****************************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<div class=\"row\">\n    <div class=\"col m12 s12\">\n        <mat-card class=\"mat-elevation-z4 fullWidth\">\n            <mat-card-title>\n                <h4>Reporte de ventas</h4>\n            </mat-card-title>\n            <mat-card-content>\n                <form #frmEntidad=\"ngForm\" (ngSubmit)=\"frmEntidad.form.valid && onSubmit()\" novalidate>\n                    <mat-form-field class=\"fullWidth\">\n                        <mat-label>Tipo</mat-label>\n                        <mat-select name=\"tipo_reporte\" [(ngModel)]=\"params.tipo_reporte\" required>\n                            <mat-option *ngFor=\"let tr of tiposReporte\" [value]=\"tr.tipo_reporte\">\n                                {{tr.descripcion}}\n                            </mat-option>\n                        </mat-select>\n                    </mat-form-field>\n                    <mat-form-field class=\"fullWidth\">\n                        <input type=\"date\" matInput placeholder=\"Del\" name=\"fdel\" [(ngModel)]=\"params.fdel\" required>\n                    </mat-form-field>\n                    <mat-form-field class=\"fullWidth\">\n                        <input type=\"date\" matInput placeholder=\"Al\" name=\"fal\" [(ngModel)]=\"params.fal\" required>\n                    </mat-form-field>\n                    <div align=\"end\">\n                        <button mat-icon-button type=\"button\" color=\"accent\" (click)=\"getReporte(1)\" [disabled]=\"!frmEntidad.form.valid\">\n                            <mat-icon>code</mat-icon>\n                        </button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n                        <button mat-icon-button type=\"button\" color=\"accent\" (click)=\"getReporte(2)\" [disabled]=\"!frmEntidad.form.valid\">\n                            <mat-icon>picture_as_pdf</mat-icon>\n                        </button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n                        <button mat-icon-button type=\"button\" color=\"accent\" (click)=\"getReporte(3)\" [disabled]=\"!frmEntidad.form.valid\">\n                            <mat-icon>library_books</mat-icon>\n                        </button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n                        <button mat-icon-button type=\"button\" color=\"accent\" (click)=\"resetParams()\">\n                            <mat-icon>restore</mat-icon>\n                        </button>\n                    </div>\n                </form>\n            </mat-card-content>\n            <!--\n            <mat-card-footer>\n                <div align=\"center\" *ngIf=\"!!msgGenerandoReporte\">\n                    <h2>{{msgGenerandoReporte}}</h2>\n                    <h4>{{params | json}}</h4>\n                </div>\n            </mat-card-footer>\n            -->\n        </mat-card>\n    </div>\n</div>\n<div class=\"row\" *ngIf=\"params.tipo_reporte === 1 && porCategoria.length > 0\">\n    <div class=\"col m12 s12\">\n        <app-por-categoria [params]=\"params\" [data]=\"porCategoria\"></app-por-categoria>\n    </div>\n</div>\n<div class=\"row\" *ngIf=\"params.tipo_reporte === 2 && porArticulo.length > 0\">\n    <div class=\"col m12 s12\">\n        <app-por-articulo [params]=\"params\" [data]=\"porArticulo\"></app-por-articulo>\n    </div>\n</div>");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/turnos/turnos.component.html": 
        /*!********************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/turnos/turnos.component.html ***!
          \********************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<div class=\"row\">\n    <div class=\"col m12 s12\">\n        <mat-card class=\"mat-elevation-z4 fullWidth\">\n            <mat-card-title>\n                <h4>Reporte de Turnos</h4>\n            </mat-card-title>\n            <mat-card-content>\n                <form #frmEntidad=\"ngForm\" novalidate>\n                    <app-rpt-fechas [(fdel)]=\"params.fdel\" [(fal)]=\"params.fal\" [configuracion]=\"configParams\"></app-rpt-fechas>\n                    <app-rpt-botones\n                        [configuracion]=\"configBotones\"\n                        (htmlClick)=\"getReporte()\"\n                        (pdfClick)=\"getReporte()\"\n                        (excelClick)=\"getReporte()\"\n                        (resetParamsClick)=\"resetParams()\">\n                    </app-rpt-botones>\n                </form>\n            </mat-card-content>\n        </mat-card>                \n    </div>\n</div>\n");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/tran-areas/tran-areas.component.html": 
        /*!*******************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/tran-areas/tran-areas.component.html ***!
          \*******************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<mat-sidenav-container class=\"matSideNavContainer\">\n    <mat-sidenav #rightSidenav mode=\"over\" [(opened)]=\"openedRightPanel\" (closedStart)=\"cerrandoRightSideNav()\" position=\"end\">\n        <app-tran-comanda #snTranComanda [mesaEnUso]=\"mesaSeleccionada\"></app-tran-comanda>        \n        <button mat-icon-button type=\"button\" color=\"accent\" (click)=\"toggleRightSidenav()\">\n            <mat-icon>close</mat-icon>\n        </button>\n    </mat-sidenav>\n    <mat-sidenav-content>\n        <mat-tab-group dynamicHeight backgroundColor=\"primary\">\n            <mat-tab #tabArea *ngFor=\"let tabA of lstTabsAreas\" label=\"{{tabA.nombre}}\">\n                <div #matTabArea class=\"divAreaMesa\" (window:resize)=\"onResize($event)\">\n                    <app-mesa *ngFor=\"let m of tabA.mesas\" [configuracion]=\"m\" (onClickMesa)=\"onClickMesa($event)\"></app-mesa>\n                </div>\n            </mat-tab>\n        </mat-tab-group>\n    </mat-sidenav-content>\n</mat-sidenav-container>");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/tran-comanda/tran-comanda.component.html": 
        /*!***********************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/tran-comanda/tran-comanda.component.html ***!
          \***********************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<div class=\"divFullSize\">\n    <div class=\"row\">\n        <div class=\"col m12 s12\" align=\"center\">\n            <span class=\"bld\" style=\"font-size: 14pt;\">{{mesaEnUso.mesa.area.nombre}} - Mesa #{{mesaEnUso.mesa.numero}}</span>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"col m12 s12\" align=\"center\" style=\"padding: 0 !important;\">\n            <button mat-raised-button type=\"button\" color=\"accent\" *ngFor=\"let cta of mesaEnUso.cuentas\" [disabled]=\"+cta.cerrada == 1\"\n                (click)=\"setSelectedCuenta(cta.numero)\">\n                {{cta.nombre}}\n            </button>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"col m6 s12\" align=\"center\" style=\"padding: 0 !important;\">\n            <span class=\"bld\">Productos</span>\n        </div>\n        <div class=\"col m6 s12\" align=\"center\" style=\"padding: 0 !important;\">\n            <span class=\"bld\" *ngIf=\"cuentaActiva.nombre\">Cuenta de {{cuentaActiva.nombre}}</span>\n            <span class=\"bld\" *ngIf=\"!cuentaActiva.nombre\">Por favor seleccione una cuenta. Gracias.</span>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"col m6 s12 mat-elevation-z3\" style=\"overflow-y: auto;\">\n            <app-lista-producto (productoClickedEv)=\"addProductoSelected($event)\"></app-lista-producto>\n        </div>\n        <div class=\"col m6 s12 mat-elevation-z3\" style=\"overflow-y: auto;\">\n            <app-lista-productos-comanda [listaProductos]=\"lstProductosDeCuenta\" [noCuenta]=\"+cuentaActiva.numero\" [IdComanda]=\"mesaEnUso.comanda\" [IdCuenta]=\"cuentaActiva.cuenta\"\n                (productoRemovedEv)=\"updProductosCuenta($event)\"></app-lista-productos-comanda>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"col m12 s12\" align=\"center\">\n            <button mat-raised-button type=\"button\" color=\"accent\" (click)=\"printComanda()\" [disabled]=\"!cuentaActiva.nombre\">\n                Comanda\n            </button>\n            <button mat-raised-button type=\"button\" color=\"accent\" (click)=\"printCuenta()\" [disabled]=\"!cuentaActiva.nombre\">\n                Cuenta\n            </button>\n            <button mat-raised-button type=\"button\" color=\"accent\" (click)=\"unirCuentas()\" [disabled]=\"mesaEnUso.cuentas.length < 2\">\n                Unir cuentas\n            </button>\n            <button mat-raised-button type=\"button\" color=\"accent\" (click)=\"cobrarCuenta()\" [disabled]=\"!cuentaActiva.nombre\">\n                Cobrar cuenta\n            </button>\n        </div>\n    </div>\n</div>\n<!--\n<app-window *ngIf=\"showPortalComanda && cuentaActiva.nombre\" [windowConfig]=\"windowConfig\">\n    <div class=\"row\">\n        <div class=\"col\" style=\"text-align: center; border-bottom: solid 1px black; padding: 0; font-Weight: bold;\">\n            <span style=\"font-size: 14pt;\">Rest-Touch Pro</span><br />\n            <span style=\"font-size: 16pt;\">Comanda #{{noComanda}}</span><br />\n            <span style=\"font-size: 16pt;\">{{cuentaActiva.nombre}}</span>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"col\">\n            <table class=\"table\">\n                <ng-container *ngFor=\"let p of lstProductosAImprimir\">\n                    <tr>\n                        <td>{{p.cantidad}}</td>\n                        <td>{{p.nombre}}</td>\n                    </tr>\n                    <tr *ngIf=\"p.notas || p.notas.length > 0 || p.notas != ''\">\n                        <td colspan=\"2\" style=\"padding-left: 15px;\"><p>{{p.notas}}</p></td>\n                    </tr>\n                </ng-container>\n            </table>\n        </div>\n    </div>\n    <hr />\n    <div class=\"d-flex justify-content-end\">\n        <button mat-raised-button type=\"button\" color=\"accent\" (click)=\"this.showPortalComanda = false\">Cerrar</button>\n    </div>\n</app-window>\n<app-window *ngIf=\"showPortalCuenta && cuentaActiva.nombre\" [windowConfig]=\"windowConfig\">\n    <div class=\"row\">\n        <div class=\"col\" style=\"text-align: center; border-bottom: solid 1px black; padding: 0; font-Weight: bold;\">\n            <span style=\"font-size: 14pt;\">Rest-Touch Pro</span><br />\n            <span style=\"font-size: 16pt;\">Cuenta {{cuentaActiva.nombre}}</span>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"col\">\n            <table class=\"table\" style=\"width: 100%; border-collapse: collapse;\">\n                <tr *ngFor=\"let p of lstProductosAImprimir\">\n                    <td style=\"width: 10%; text-align: center;\">{{p.cantidad}}</td>\n                    <td style=\"width: 65%;\">{{p.nombre}}</td>\n                    <td style=\"width: 25%; text-align: right;\">{{(p.cantidad * p.precio) | number:'1.2-2'}}</td>\n                </tr>\n                <tfoot>\n                    <tr>\n                        <td colspan=\"2\" style=\"width: 75%; text-align: right; font-weight: bold;\">TOTAL: </td>\n                        <td\n                            style=\"width: 25%; text-align: right; font-weight: bold; border-top: solid 1px black; border-bottom: double 5px black;\">\n                            {{sumCuenta | number:'1.2-2'}}</td>\n                    </tr>\n                </tfoot>\n            </table>\n        </div>\n    </div>\n    <hr />\n    <div style=\"text-align: end; align-items: flex-end;\">\n        <button mat-raised-button type=\"button\" color=\"accent\" (click)=\"this.showPortalCuenta = false\">Cerrar</button>\n    </div>\n</app-window>\n-->");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/turno/form-turno/form-turno.component.html": 
        /*!*************************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/turno/form-turno/form-turno.component.html ***!
          \*************************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<mat-card class=\"mat-elevation-z4 fullWidth\">\n    <mat-card-title>\n        <h4>\n            Turno {{!!turno.turno ? (turno.inicio | date:'dd/MM/yyyy HH:mm:ss') : ''}}\n            <button mat-icon-button type=\"button\" color=\"accent\" (click)=\"showTurnoForm = true;\" *ngIf=\"!showTurnoForm\">\n                <mat-icon class=\"iconFontSize\">expand_more</mat-icon>\n            </button>\n            <button mat-icon-button type=\"button\" color=\"accent\" (click)=\"showTurnoForm = false;\" *ngIf=\"showTurnoForm\">\n                <mat-icon class=\"iconFontSize\">expand_less</mat-icon>\n            </button>\n        </h4>\n    </mat-card-title>\n    <mat-card-content>\n        <form #frmTurno=\"ngForm\" *ngIf=\"showTurnoForm\" (ngSubmit)=\"frmTurno.form.valid && onSubmit()\" novalidate>\n            <div class=\"form-group\">\n                <mat-form-field class=\"fullWidth\">\n                    <mat-label>Tipo de turno</mat-label>\n                    <mat-select name=\"turno_tipo\" [(ngModel)]=\"turno.turno_tipo\" required>\n                        <mat-option *ngFor=\"let tt of tiposTurno\" [value]=\"tt.turno_tipo\">\n                            {{tt.descripcion}}\n                        </mat-option>\n                    </mat-select>\n                </mat-form-field>\n            </div>\n            <div class=\"form-group\">\n                <mat-form-field class=\"fullWidth\" *ngIf=\"esMovil\">\n                    <input matInput type=\"datetime\" placeholder=\"Inicio\" name=\"inicio\" [(ngModel)]=\"turno.inicio\" required>\n                </mat-form-field>\n                <mat-form-field class=\"fullWidth\" *ngIf=\"!esMovil\">\n                    <input matInput ng-virtual-keyboard ng-virtual-keyboard-layout=\"phone\" ng-virtual-keyboard-placeholder=\"Inicio\" type=\"datetime\" placeholder=\"Inicio\" name=\"inicio\" [(ngModel)]=\"turno.inicio\" required>\n                </mat-form-field>\n            </div>\n            <div class=\"form-group\">\n                <mat-form-field class=\"fullWidth\" *ngIf=\"esMovil\">\n                    <input matInput type=\"datetime\" placeholder=\"Fin\" name=\"fin\" [(ngModel)]=\"turno.fin\">\n                </mat-form-field>\n                <mat-form-field class=\"fullWidth\" *ngIf=\"!esMovil\">\n                    <input matInput ng-virtual-keyboard ng-virtual-keyboard-layout=\"phone\" ng-virtual-keyboard-placeholder=\"Fin\" type=\"datetime\" placeholder=\"Fin\" name=\"fin\" [(ngModel)]=\"turno.fin\">\n                </mat-form-field>\n            </div>\n            <div class=\"btn-group d-flex justify-content-end\" role=\"group\">\n                <button mat-icon-button type=\"submit\" color=\"accent\" [disabled]=\"!frmTurno.form.valid || !!turno.fin\">\n                    <mat-icon>save</mat-icon>\n                </button>\n                <button mat-icon-button type=\"button\" color=\"accent\" (click)=\"resetTurno()\" *ngIf=\"turno.turno\">\n                    <mat-icon>add</mat-icon>\n                </button>\n            </div>\n        </form>\n    </mat-card-content>\n</mat-card>\n<hr *ngIf=\"turno.turno\" />\n<mat-card class=\"mat-elevation-z4 fullWidth\" *ngIf=\"turno.turno\">\n    <mat-card-title>\n        <h4>\n            Detalle del turno {{turno.inicio | date:'dd/MM/yyyy HH:mm:ss'}}\n            <button mat-icon-button type=\"button\" color=\"accent\" (click)=\"showDetalleTurnoForm = true;\" *ngIf=\"!showDetalleTurnoForm\">\n                <mat-icon class=\"iconFontSize\">expand_more</mat-icon>\n            </button>\n            <button mat-icon-button type=\"button\" color=\"accent\" (click)=\"showDetalleTurnoForm = false;\" *ngIf=\"showDetalleTurnoForm\">\n                <mat-icon class=\"iconFontSize\">expand_less</mat-icon>\n            </button>\n        </h4>\n    </mat-card-title>\n    <mat-card-content>\n        <form #frmDetalleTurno=\"ngForm\" *ngIf=\"showDetalleTurnoForm\" (ngSubmit)=\"frmDetalleTurno.form.valid && onSubmitDetail()\" novalidate>\n            <div class=\"form-group\">\n                <mat-form-field class=\"fullWidth\">\n                    <mat-label>Tipo</mat-label>\n                    <mat-select name=\"usuario_tipo\" [(ngModel)]=\"detalleTurno.usuario_tipo\" required>\n                        <mat-option *ngFor=\"let tu of tiposUsuario\" [value]=\"tu.usuario_tipo\">\n                            {{tu.descripcion}}\n                        </mat-option>\n                    </mat-select>\n                </mat-form-field>\n            </div>\n            <div class=\"form-group\">\n                <mat-form-field class=\"fullWidth\">\n                    <mat-label>Usuario</mat-label>\n                    <mat-select name=\"usuario\" [(ngModel)]=\"detalleTurno.usuario\" required>\n                        <mat-option *ngFor=\"let u of usuarios\" [value]=\"u.usuario\">\n                            {{u.nombres}} {{u.apellidos}}\n                        </mat-option>\n                    </mat-select>\n                </mat-form-field>\n            </div>\n            <div class=\"btn-group d-flex justify-content-end\" role=\"group\">\n                <button mat-icon-button type=\"submit\" color=\"accent\" [disabled]=\"!frmDetalleTurno.form.valid || !!turno.fin\">\n                    <mat-icon>save</mat-icon>\n                </button>\n                <!--\n                <button mat-icon-button type=\"button\" color=\"accent\" (click)=\"resetDetalleIngreso()\"\n                    *ngIf=\"detalleTurno.ingreso_detalle\">\n                    <mat-icon>add</mat-icon>\n                </button>\n                -->\n            </div>\n        </form>\n        <hr *ngIf=\"detallesTurno.length > 0\"/>\n        <table mat-table [dataSource]=\"dataSource\" class=\"mat-elevation-z4 full-width\" *ngIf=\"detallesTurno.length > 0\">\n            <ng-container matColumnDef=\"usuario_tipo\">\n                <th mat-header-cell *matHeaderCellDef>Tipo</th>\n                <td mat-cell *matCellDef=\"let element\" class=\"text-wrap\">{{element.usuario_tipo.descripcion}}</td>\n            </ng-container>\n            <ng-container matColumnDef=\"usuario\">\n                <th mat-header-cell *matHeaderCellDef class=\"text-right\">Usuario</th>\n                <td mat-cell *matCellDef=\"let element\" class=\"text-right\">{{element.usuario.nombres}} {{element.usuario.apellidos}}</td>\n            </ng-container>\n            <ng-container matColumnDef=\"editItem\">\n                <th mat-header-cell *matHeaderCellDef>&nbsp;</th>\n                <td mat-cell *matCellDef=\"let element\" class=\"text-wrap\">\n                    <button mat-icon-button type=\"button\" color=\"accent\" (click)=\"anularDetalleTurno(element)\" [disabled]=\"!!turno.fin\">\n                        <mat-icon>not_interested</mat-icon>\n                    </button>\n                </td>\n            </ng-container>\n            <tr mat-header-row *matHeaderRowDef=\"displayedColumns\"></tr>\n            <tr mat-row *matRowDef=\"let row; columns: displayedColumns;\">\n            </tr>\n        </table>\n    </mat-card-content>\n</mat-card>");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/turno/lista-turno/lista-turno.component.html": 
        /*!***************************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/turno/lista-turno/lista-turno.component.html ***!
          \***************************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<mat-card class=\"mat-elevation-z4 fullWidth\">\n    <mat-card-content>\n        <mat-form-field>\n            <input matInput (keyup)=\"applyFilter($event.target.value)\" placeholder=\"Buscar...\">\n        </mat-form-field>\n        <table mat-table [dataSource]=\"dataSource\">\n            <ng-container matColumnDef=\"turno\">\n                <!--<th mat-header-cell *matHeaderCellDef> No. </th>-->\n                <td mat-cell *matCellDef=\"let element\" (click)=\"getTurno(element)\">\n                    <mat-list>\n                        <mat-list-item>\n                            <mat-icon mat-list-icon>schedule</mat-icon>\n                            <h5 mat-line>Inicio: {{element.inicio | date: 'dd/MM/yyyy HH:mm:ss'}}</h5><br/>\n                            <p mat-line>\n                                Fin: {{element.fin | date: 'dd/MM/yyyy'}}\n                            </p>\n                            <button mat-icon-button type=\"button\" color=\"accent\">\n                                <mat-icon>arrow_right_alt</mat-icon>\n                            </button>\n                        </mat-list-item>\n                    </mat-list>\n                </td>\n            </ng-container>\n            <!--<tr mat-header-row *matHeaderRowDef=\"displayedColumns\"></tr>-->\n            <tr mat-row *matRowDef=\"let row; columns: displayedColumns;\"></tr>\n        </table>\n        <mat-paginator [pageSizeOptions]=\"[5, 10, 20]\" showFirstLastButtons></mat-paginator>\n    </mat-card-content>\n</mat-card>\n");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/turno/turno/turno.component.html": 
        /*!***************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/turno/turno/turno.component.html ***!
          \***************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<div class=\"row\">\n    <div class=\"col m5 s12\">\n        <app-lista-turno #lstTurno (getTurnoEv)=\"setTurno($event)\"></app-lista-turno>\n    </div>\n    <div class=\"col m7 s12\">\n        <app-form-turno #frmTurno [turno]=\"turno\" (turnoSavedEv)=\"refreshTurnoList()\"></app-form-turno>\n    </div>\n</div>");
            /***/ 
        }),
        /***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/unir-cuenta/unir-cuenta.component.html": 
        /*!*********************************************************************************************************************!*\
          !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/unir-cuenta/unir-cuenta.component.html ***!
          \*********************************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("<h1 mat-dialog-title>Unir cuentas</h1>\n<div mat-dialog-content>\n    <form #frmUnirCuenta=\"ngForm\" novalidate>\n        <mat-form-field>\n            <mat-label>Unir cuenta de</mat-label>\n            <mat-select name=\"cuentaDe\" [(ngModel)]=\"cuentaDe\" required>\n                <mat-option *ngFor=\"let ctaDe of data.mesaEnUso.cuentas\" [value]=\"ctaDe.numero\">\n                    {{ctaDe.nombre}}\n                </mat-option>\n            </mat-select>\n        </mat-form-field>\n        <mat-form-field>\n            <mat-label>con la cuenta de</mat-label>\n            <mat-select name=\"cuentaA\" [(ngModel)]=\"cuentaA\"  required>\n                <mat-option *ngFor=\"let ctaA of data.mesaEnUso.cuentas\" [value]=\"ctaA.numero\">\n                    {{ctaA.nombre}}\n                </mat-option>\n            </mat-select>\n        </mat-form-field>\n        <div class=\"d-flex justify-content-end\" style=\"width: 100%;\">\n            <button mat-raised-button type=\"button\" color=\"accent\" (click)=\"unirCuentas(cuentaDe, cuentaA)\" [disabled]=\"!frmUnirCuenta.form.valid || +cuentaDe === +cuentaA\">\n                Unir cuentas\n            </button>\n            <button mat-raised-button type=\"button\" color=\"accent\" (click)=\"unirTodas()\">\n                Unir todas en una sola\n            </button>\n        </div>\n    </form>\n</div>\n<div mat-dialog-actions class=\"d-flex justify-content-end\">\n    <button mat-icon-button (click)=\"cancelar()\" color=\"warn\">\n        <mat-icon>cancel_presentation</mat-icon>\n    </button>\n    <!--\n    <button mat-icon-button [mat-dialog-close]=\"data\" [disabled]=\"!frmUnirCuenta.form.valid\" color=\"accent\">\n        <mat-icon>check_circle</mat-icon>\n    </button>\n    -->\n</div>");
            /***/ 
        }),
        /***/ "./src/app/admin/services/usuario-tipo.service.ts": 
        /*!********************************************************!*\
          !*** ./src/app/admin/services/usuario-tipo.service.ts ***!
          \********************************************************/
        /*! exports provided: UsuarioTipoService */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UsuarioTipoService", function () { return UsuarioTipoService; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm2015/http.js");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var _shared_error_handler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../shared/error-handler */ "./src/app/shared/error-handler.ts");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm2015/operators/index.js");
            /* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! qs */ "./node_modules/qs/lib/index.js");
            /* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/ __webpack_require__.n(qs__WEBPACK_IMPORTED_MODULE_7__);
            var UsuarioTipoService = /** @class */ (function () {
                function UsuarioTipoService(http, ls) {
                    this.http = http;
                    this.ls = ls;
                    //private moduleUrl: string = 'turno';
                    this.usrToken = null;
                    this.srvcErrHndl = new _shared_error_handler__WEBPACK_IMPORTED_MODULE_4__["ServiceErrorHandler"]();
                    this.usrToken = this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar) ? this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar).token : null;
                }
                UsuarioTipoService.prototype.get = function (fltr) {
                    if (fltr === void 0) { fltr = {}; }
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlCatalogos + "/get_tipo_usuario?" + qs__WEBPACK_IMPORTED_MODULE_7__["stringify"](fltr), httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                return UsuarioTipoService;
            }());
            UsuarioTipoService.ctorParameters = function () { return [
                { type: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__["LocalstorageService"] }
            ]; };
            UsuarioTipoService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
                    providedIn: 'root'
                })
            ], UsuarioTipoService);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/abrir-mesa/abrir-mesa.component.css": 
        /*!****************************************************************************!*\
          !*** ./src/app/restaurante/components/abrir-mesa/abrir-mesa.component.css ***!
          \****************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3Jlc3RhdXJhbnRlL2NvbXBvbmVudHMvYWJyaXItbWVzYS9hYnJpci1tZXNhLmNvbXBvbmVudC5jc3MifQ== */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/abrir-mesa/abrir-mesa.component.ts": 
        /*!***************************************************************************!*\
          !*** ./src/app/restaurante/components/abrir-mesa/abrir-mesa.component.ts ***!
          \***************************************************************************/
        /*! exports provided: AbrirMesaComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AbrirMesaComponent", function () { return AbrirMesaComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/esm2015/dialog.js");
            /* harmony import */ var _pide_datos_cuentas_pide_datos_cuentas_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../pide-datos-cuentas/pide-datos-cuentas.component */ "./src/app/restaurante/components/pide-datos-cuentas/pide-datos-cuentas.component.ts");
            /* harmony import */ var _admin_services_usuario_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../admin/services/usuario.service */ "./src/app/admin/services/usuario.service.ts");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../shared/global */ "./src/app/shared/global.ts");
            var AbrirMesaComponent = /** @class */ (function () {
                function AbrirMesaComponent(dialogRef, data, dialogDatosCuentas, usuarioSrvc, ls) {
                    var _this = this;
                    this.dialogRef = dialogRef;
                    this.data = data;
                    this.dialogDatosCuentas = dialogDatosCuentas;
                    this.usuarioSrvc = usuarioSrvc;
                    this.ls = ls;
                    this.lstMeseros = [];
                    this.esMovil = false;
                    this.loadMeseros = function () {
                        _this.usuarioSrvc.get({ debaja: 0, sede: (_this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_6__["GLOBAL"].usrTokenVar).sede || 0), esmesero: 1 }).subscribe(function (res) {
                            if (res) {
                                _this.lstMeseros = res;
                            }
                        });
                    };
                    this.toNumber = function (valor) { return +valor; };
                }
                AbrirMesaComponent.prototype.ngOnInit = function () {
                    this.esMovil = this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_6__["GLOBAL"].usrTokenVar).enmovil || false;
                    this.loadMeseros();
                };
                AbrirMesaComponent.prototype.pedirDatosDeCuentas = function (obj) {
                    var _this = this;
                    var pideDatosCuentasRef = this.dialogDatosCuentas.open(_pide_datos_cuentas_pide_datos_cuentas_component__WEBPACK_IMPORTED_MODULE_3__["PideDatosCuentasComponent"], {
                        width: '50%',
                        disableClose: true,
                        data: obj.cuentas
                    });
                    pideDatosCuentasRef.afterClosed().subscribe(function (result) {
                        obj.cuentas = result;
                        _this.dialogRef.close(obj);
                    });
                };
                AbrirMesaComponent.prototype.terminar = function (obj) {
                    if (obj === void 0) { obj = null; }
                    if (!obj) {
                        this.dialogRef.close();
                    }
                    else {
                        if (!obj.dividirCuentasPorSillas) {
                            this.dialogRef.close(obj);
                        }
                        else {
                            this.pedirDatosDeCuentas(obj);
                        }
                    }
                };
                return AbrirMesaComponent;
            }());
            AbrirMesaComponent.ctorParameters = function () { return [
                { type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MatDialogRef"] },
                { type: undefined, decorators: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"], args: [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"],] }] },
                { type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MatDialog"] },
                { type: _admin_services_usuario_service__WEBPACK_IMPORTED_MODULE_4__["UsuarioService"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__["LocalstorageService"] }
            ]; };
            AbrirMesaComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-abrir-mesa',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./abrir-mesa.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/abrir-mesa/abrir-mesa.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./abrir-mesa.component.css */ "./src/app/restaurante/components/abrir-mesa/abrir-mesa.component.css")).default]
                }),
                tslib__WEBPACK_IMPORTED_MODULE_0__["__param"](1, Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"])(_angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"]))
            ], AbrirMesaComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/area/area-designer/area-designer.component.css": 
        /*!***************************************************************************************!*\
          !*** ./src/app/restaurante/components/area/area-designer/area-designer.component.css ***!
          \***************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = (".diseniador {\n    width: 750px;\n    height: 650px;\n    overflow: hidden !important;\n    padding: 0 !important;\n    /*border: dashed 1px #c7c7c749;*/\n}\n\n.areaPosicionamiento {\n    width: 100%;\n    height: 600px;\n    overflow: hidden !important;\n    background-color: #c7c7c749;\n    padding: 0 !important;\n    position: relative;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy9hcmVhL2FyZWEtZGVzaWduZXIvYXJlYS1kZXNpZ25lci5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0lBQ0ksWUFBWTtJQUNaLGFBQWE7SUFDYiwyQkFBMkI7SUFDM0IscUJBQXFCO0lBQ3JCLGdDQUFnQztBQUNwQzs7QUFFQTtJQUNJLFdBQVc7SUFDWCxhQUFhO0lBQ2IsMkJBQTJCO0lBQzNCLDJCQUEyQjtJQUMzQixxQkFBcUI7SUFDckIsa0JBQWtCO0FBQ3RCIiwiZmlsZSI6InNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy9hcmVhL2FyZWEtZGVzaWduZXIvYXJlYS1kZXNpZ25lci5jb21wb25lbnQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmRpc2VuaWFkb3Ige1xuICAgIHdpZHRoOiA3NTBweDtcbiAgICBoZWlnaHQ6IDY1MHB4O1xuICAgIG92ZXJmbG93OiBoaWRkZW4gIWltcG9ydGFudDtcbiAgICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XG4gICAgLypib3JkZXI6IGRhc2hlZCAxcHggI2M3YzdjNzQ5OyovXG59XG5cbi5hcmVhUG9zaWNpb25hbWllbnRvIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IDYwMHB4O1xuICAgIG92ZXJmbG93OiBoaWRkZW4gIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjYzdjN2M3NDk7XG4gICAgcGFkZGluZzogMCAhaW1wb3J0YW50O1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn0iXX0= */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/area/area-designer/area-designer.component.ts": 
        /*!**************************************************************************************!*\
          !*** ./src/app/restaurante/components/area/area-designer/area-designer.component.ts ***!
          \**************************************************************************************/
        /*! exports provided: AreaDesignerComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AreaDesignerComponent", function () { return AreaDesignerComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/esm2015/dialog.js");
            /* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/snack-bar */ "./node_modules/@angular/material/esm2015/snack-bar.js");
            var AreaDesignerComponent = /** @class */ (function () {
                function AreaDesignerComponent(_snackBar, dialogRef, data) {
                    var _this = this;
                    this._snackBar = _snackBar;
                    this.dialogRef = dialogRef;
                    this.data = data;
                    this.mesas = [];
                    this.getNextTableNumber = function () { return _this.mesas.length > 0 ? (_this.mesas.reduce(function (max, p) { return +p.numero > max ? +p.numero : max; }, (!!_this.mesas[0].numero ? +_this.mesas[0].numero : 0)) + 1) : 1; };
                    this.addTable = function () {
                        _this.mesas.push({
                            mesa: null,
                            area: _this.data.area,
                            numero: _this.getNextTableNumber(),
                            posx: 1,
                            posy: 1,
                            tamanio: 72,
                            estatus: 1
                        });
                    };
                    this.onClickMesa = function (obj) { };
                    this.terminar = function () {
                        // console.log(this.mesas);
                        _this.dialogRef.close(_this.mesas);
                    };
                }
                AreaDesignerComponent.prototype.ngOnInit = function () {
                    // console.log(this.data);
                    this.mesas = this.data.mesas;
                    // console.log(this.mesas);
                };
                return AreaDesignerComponent;
            }());
            AreaDesignerComponent.ctorParameters = function () { return [
                { type: _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_3__["MatSnackBar"] },
                { type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MatDialogRef"] },
                { type: undefined, decorators: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"], args: [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"],] }] }
            ]; };
            AreaDesignerComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-area-designer',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./area-designer.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/area/area-designer/area-designer.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./area-designer.component.css */ "./src/app/restaurante/components/area/area-designer/area-designer.component.css")).default]
                }),
                tslib__WEBPACK_IMPORTED_MODULE_0__["__param"](2, Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"])(_angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"]))
            ], AreaDesignerComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/area/area/area.component.css": 
        /*!*********************************************************************!*\
          !*** ./src/app/restaurante/components/area/area/area.component.css ***!
          \*********************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3Jlc3RhdXJhbnRlL2NvbXBvbmVudHMvYXJlYS9hcmVhL2FyZWEuY29tcG9uZW50LmNzcyJ9 */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/area/area/area.component.ts": 
        /*!********************************************************************!*\
          !*** ./src/app/restaurante/components/area/area/area.component.ts ***!
          \********************************************************************/
        /*! exports provided: AreaComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AreaComponent", function () { return AreaComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            var AreaComponent = /** @class */ (function () {
                function AreaComponent() {
                    var _this = this;
                    this.setArea = function (obj) { return _this.area = obj; };
                    this.refreshAreaList = function () {
                        _this.lstAreasComponent.loadEntidades();
                    };
                    this.area = { area: null, sede: null, nombre: null };
                }
                AreaComponent.prototype.ngOnInit = function () {
                };
                return AreaComponent;
            }());
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('listaAreas', { static: false })
            ], AreaComponent.prototype, "lstAreasComponent", void 0);
            AreaComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-area',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./area.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/area/area/area.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./area.component.css */ "./src/app/restaurante/components/area/area/area.component.css")).default]
                })
            ], AreaComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/area/form-area/form-area.component.css": 
        /*!*******************************************************************************!*\
          !*** ./src/app/restaurante/components/area/form-area/form-area.component.css ***!
          \*******************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = (".full-width {\n    width: 100%;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy9hcmVhL2Zvcm0tYXJlYS9mb3JtLWFyZWEuY29tcG9uZW50LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtJQUNJLFdBQVc7QUFDZiIsImZpbGUiOiJzcmMvYXBwL3Jlc3RhdXJhbnRlL2NvbXBvbmVudHMvYXJlYS9mb3JtLWFyZWEvZm9ybS1hcmVhLmNvbXBvbmVudC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuZnVsbC13aWR0aCB7XG4gICAgd2lkdGg6IDEwMCU7XG59Il19 */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/area/form-area/form-area.component.ts": 
        /*!******************************************************************************!*\
          !*** ./src/app/restaurante/components/area/form-area/form-area.component.ts ***!
          \******************************************************************************/
        /*! exports provided: FormAreaComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormAreaComponent", function () { return FormAreaComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/snack-bar */ "./node_modules/@angular/material/esm2015/snack-bar.js");
            /* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/esm2015/dialog.js");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var _area_designer_area_designer_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../area-designer/area-designer.component */ "./src/app/restaurante/components/area/area-designer/area-designer.component.ts");
            /* harmony import */ var _services_area_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../services/area.service */ "./src/app/restaurante/services/area.service.ts");
            var FormAreaComponent = /** @class */ (function () {
                function FormAreaComponent(_snackBar, dialog, entidadSrvc, ls) {
                    var _this = this;
                    this._snackBar = _snackBar;
                    this.dialog = dialog;
                    this.entidadSrvc = entidadSrvc;
                    this.ls = ls;
                    this.entidadSavedEv = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
                    this.sedeUsr = 0;
                    this.lstAreas = [];
                    this.esMovil = false;
                    this.loadAreas = function () { return _this.entidadSrvc.get({ sede: _this.sedeUsr }).subscribe(function (res) { return _this.lstAreas = res; }); };
                    this.resetEntidad = function () { return _this.entidad = { area: null, sede: _this.sedeUsr, nombre: null, mesas: [] }; };
                    this.onSubmit = function () {
                        // console.log(this.entidad); return;
                        _this.entidadSrvc.save(_this.entidad).subscribe(function (res) {
                            if (res) {
                                _this._snackBar.open('Guardado con éxito...', 'Guardar', { duration: 3000 });
                                _this.resetEntidad();
                                _this.loadAreas();
                                _this.entidadSavedEv.emit();
                            }
                        });
                    };
                    this.openDesigner = function () {
                        var areaDesignerRef = _this.dialog.open(_area_designer_area_designer_component__WEBPACK_IMPORTED_MODULE_6__["AreaDesignerComponent"], {
                            width: '800px',
                            disableClose: false,
                            data: { area: +_this.entidad.area, mesas: _this.entidad.mesas || [] }
                        });
                        areaDesignerRef.afterClosed().subscribe(function (result) {
                            if (result) {
                                // console.log(result);
                                _this.entidadSavedEv.emit();
                                _this.entidadSrvc.get({ area: +_this.entidad.area }).subscribe(function (res) {
                                    if (res && res.length > 0) {
                                        _this.entidad = res[0];
                                    }
                                });
                            }
                        });
                    };
                }
                FormAreaComponent.prototype.ngOnInit = function () {
                    this.sedeUsr = this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_5__["GLOBAL"].usrTokenVar).sede || 0;
                    this.esMovil = this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_5__["GLOBAL"].usrTokenVar).enmovil || false;
                    this.resetEntidad();
                    this.loadAreas();
                };
                return FormAreaComponent;
            }());
            FormAreaComponent.ctorParameters = function () { return [
                { type: _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_2__["MatSnackBar"] },
                { type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__["MatDialog"] },
                { type: _services_area_service__WEBPACK_IMPORTED_MODULE_7__["AreaService"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_4__["LocalstorageService"] }
            ]; };
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])()
            ], FormAreaComponent.prototype, "entidad", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"])()
            ], FormAreaComponent.prototype, "entidadSavedEv", void 0);
            FormAreaComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-form-area',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./form-area.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/area/form-area/form-area.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./form-area.component.css */ "./src/app/restaurante/components/area/form-area/form-area.component.css")).default]
                })
            ], FormAreaComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/area/lista-area/lista-area.component.css": 
        /*!*********************************************************************************!*\
          !*** ./src/app/restaurante/components/area/lista-area/lista-area.component.css ***!
          \*********************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = (".fullWidth {\n    width: 100% !important;\n}\n\ntable {\n    width: 100% !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy9hcmVhL2xpc3RhLWFyZWEvbGlzdGEtYXJlYS5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0lBQ0ksc0JBQXNCO0FBQzFCOztBQUVBO0lBQ0ksc0JBQXNCO0FBQzFCIiwiZmlsZSI6InNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy9hcmVhL2xpc3RhLWFyZWEvbGlzdGEtYXJlYS5jb21wb25lbnQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmZ1bGxXaWR0aCB7XG4gICAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDtcbn1cblxudGFibGUge1xuICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XG59Il19 */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/area/lista-area/lista-area.component.ts": 
        /*!********************************************************************************!*\
          !*** ./src/app/restaurante/components/area/lista-area/lista-area.component.ts ***!
          \********************************************************************************/
        /*! exports provided: ListaAreaComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ListaAreaComponent", function () { return ListaAreaComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/paginator */ "./node_modules/@angular/material/esm2015/paginator.js");
            /* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/table */ "./node_modules/@angular/material/esm2015/table.js");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var _services_area_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../services/area.service */ "./src/app/restaurante/services/area.service.ts");
            var ListaAreaComponent = /** @class */ (function () {
                function ListaAreaComponent(areaSrvc, ls) {
                    var _this = this;
                    this.areaSrvc = areaSrvc;
                    this.ls = ls;
                    this.displayedColumns = ['nombre'];
                    this.getEntidadEv = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
                    this.loadEntidades = function () {
                        _this.areaSrvc.get({ sede: (_this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_5__["GLOBAL"].usrTokenVar).sede || 0) }).subscribe(function (lst) {
                            if (lst) {
                                if (lst.length > 0) {
                                    _this.lstEntidades = lst;
                                    _this.dataSource = new _angular_material_table__WEBPACK_IMPORTED_MODULE_3__["MatTableDataSource"](_this.lstEntidades);
                                    _this.dataSource.paginator = _this.paginator;
                                }
                            }
                        });
                    };
                    this.getEntidad = function (id) {
                        _this.areaSrvc.get({ area: id }).subscribe(function (lst) {
                            if (lst) {
                                if (lst.length > 0) {
                                    _this.getEntidadEv.emit(lst[0]);
                                }
                            }
                        });
                    };
                }
                ListaAreaComponent.prototype.ngOnInit = function () {
                    this.loadEntidades();
                };
                ListaAreaComponent.prototype.applyFilter = function (filterValue) {
                    this.dataSource.filter = filterValue.trim().toLowerCase();
                };
                return ListaAreaComponent;
            }());
            ListaAreaComponent.ctorParameters = function () { return [
                { type: _services_area_service__WEBPACK_IMPORTED_MODULE_6__["AreaService"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_4__["LocalstorageService"] }
            ]; };
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"])()
            ], ListaAreaComponent.prototype, "getEntidadEv", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])(_angular_material_paginator__WEBPACK_IMPORTED_MODULE_2__["MatPaginator"], { static: true })
            ], ListaAreaComponent.prototype, "paginator", void 0);
            ListaAreaComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-lista-area',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./lista-area.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/area/lista-area/lista-area.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./lista-area.component.css */ "./src/app/restaurante/components/area/lista-area/lista-area.component.css")).default]
                })
            ], ListaAreaComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/lista-productos-comanda/lista-productos-comanda.component.css": 
        /*!******************************************************************************************************!*\
          !*** ./src/app/restaurante/components/lista-productos-comanda/lista-productos-comanda.component.css ***!
          \******************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = (".fullWidth {\n    width: 100% !important;\n}\n\n.spacer {\n    flex: 1 1 auto !important;\n}\n\n.noImpreso {\n    background-color: #c7c7c7;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy9saXN0YS1wcm9kdWN0b3MtY29tYW5kYS9saXN0YS1wcm9kdWN0b3MtY29tYW5kYS5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0lBQ0ksc0JBQXNCO0FBQzFCOztBQUVBO0lBQ0kseUJBQXlCO0FBQzdCOztBQUVBO0lBQ0kseUJBQXlCO0FBQzdCIiwiZmlsZSI6InNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy9saXN0YS1wcm9kdWN0b3MtY29tYW5kYS9saXN0YS1wcm9kdWN0b3MtY29tYW5kYS5jb21wb25lbnQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmZ1bGxXaWR0aCB7XG4gICAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDtcbn1cblxuLnNwYWNlciB7XG4gICAgZmxleDogMSAxIGF1dG8gIWltcG9ydGFudDtcbn1cblxuLm5vSW1wcmVzbyB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2M3YzdjNztcbn0iXX0= */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/lista-productos-comanda/lista-productos-comanda.component.ts": 
        /*!*****************************************************************************************************!*\
          !*** ./src/app/restaurante/components/lista-productos-comanda/lista-productos-comanda.component.ts ***!
          \*****************************************************************************************************/
        /*! exports provided: ListaProductosComandaComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ListaProductosComandaComponent", function () { return ListaProductosComandaComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/snack-bar */ "./node_modules/@angular/material/esm2015/snack-bar.js");
            /* harmony import */ var _services_comanda_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../services/comanda.service */ "./src/app/restaurante/services/comanda.service.ts");
            var ListaProductosComandaComponent = /** @class */ (function () {
                function ListaProductosComandaComponent(_snackBar, ls, comandaSrvc) {
                    var _this = this;
                    this._snackBar = _snackBar;
                    this.ls = ls;
                    this.comandaSrvc = comandaSrvc;
                    this.listaProductos = [];
                    this.noCuenta = null;
                    this.listHeight = '450px';
                    this.IdComanda = 0;
                    this.IdCuenta = 0;
                    this.productoRemovedEv = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
                    this.esMovil = false;
                    this.removeProducto = function (p, idx) {
                        _this.detalleComanda = {
                            detalle_cuenta: p.detalle_cuenta, detalle_comanda: p.detalle_comanda, articulo: p.id,
                            cantidad: +p.cantidad > 1 ? (+p.cantidad) - 1 : 0,
                            precio: +p.precio,
                            total: +p.cantidad > 1 ? ((+p.cantidad) - 1) * (+p.precio) : 0,
                            notas: p.notas
                        };
                        _this.comandaSrvc.saveDetalle(_this.IdComanda, _this.IdCuenta, _this.detalleComanda).subscribe(function (res) {
                            if (res.exito) {
                                p.cantidad = _this.detalleComanda.cantidad;
                                _this.productoRemovedEv.emit(_this.listaProductos);
                            }
                            else {
                                _this._snackBar.open("ERROR: " + res.mensaje, 'Comanda', { duration: 3000 });
                            }
                        });
                    };
                }
                ListaProductosComandaComponent.prototype.ngOnInit = function () {
                    this.esMovil = this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar).enmovil || false;
                };
                /*
                deleteProductoFromList = (idx: number) => {
                  this.listaProductos.splice(idx, 1);
                  this.productoRemovedEv.emit(this.listaProductos);
                }
                */
                ListaProductosComandaComponent.prototype.toggleShowInputNotas = function (p) {
                    p.showInputNotas = !p.showInputNotas;
                    if (p.showInputNotas) {
                        p.itemListHeight = '140px';
                    }
                    else {
                        p.itemListHeight = '70px';
                    }
                };
                ListaProductosComandaComponent.prototype.doAction = function (ev) {
                    console.log(ev);
                };
                return ListaProductosComandaComponent;
            }());
            ListaProductosComandaComponent.ctorParameters = function () { return [
                { type: _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_4__["MatSnackBar"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_2__["LocalstorageService"] },
                { type: _services_comanda_service__WEBPACK_IMPORTED_MODULE_5__["ComandaService"] }
            ]; };
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])()
            ], ListaProductosComandaComponent.prototype, "listaProductos", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])()
            ], ListaProductosComandaComponent.prototype, "noCuenta", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])()
            ], ListaProductosComandaComponent.prototype, "listHeight", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])()
            ], ListaProductosComandaComponent.prototype, "IdComanda", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])()
            ], ListaProductosComandaComponent.prototype, "IdCuenta", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"])()
            ], ListaProductosComandaComponent.prototype, "productoRemovedEv", void 0);
            ListaProductosComandaComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-lista-productos-comanda',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./lista-productos-comanda.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/lista-productos-comanda/lista-productos-comanda.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./lista-productos-comanda.component.css */ "./src/app/restaurante/components/lista-productos-comanda/lista-productos-comanda.component.css")).default]
                })
            ], ListaProductosComandaComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/mesa/mesa.component.css": 
        /*!****************************************************************!*\
          !*** ./src/app/restaurante/components/mesa/mesa.component.css ***!
          \****************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = (".divMesa {\n    background-image: url('/assets/img/mesas/table_02.svg');\n    position: absolute;\n    text-align: right;\n    padding-top: 0;\n}\n\nspan {\n    font-size: 12pt;\n    font-weight: bold;\n}\n\n.disponible {\n    background-color: lightgreen;\n}\n\n.ocupada {    \n    background-color: #da332d;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy9tZXNhL21lc2EuY29tcG9uZW50LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtJQUNJLHVEQUF1RDtJQUN2RCxrQkFBa0I7SUFDbEIsaUJBQWlCO0lBQ2pCLGNBQWM7QUFDbEI7O0FBRUE7SUFDSSxlQUFlO0lBQ2YsaUJBQWlCO0FBQ3JCOztBQUVBO0lBQ0ksNEJBQTRCO0FBQ2hDOztBQUVBO0lBQ0kseUJBQXlCO0FBQzdCIiwiZmlsZSI6InNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy9tZXNhL21lc2EuY29tcG9uZW50LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5kaXZNZXNhIHtcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJy9hc3NldHMvaW1nL21lc2FzL3RhYmxlXzAyLnN2ZycpO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICB0ZXh0LWFsaWduOiByaWdodDtcbiAgICBwYWRkaW5nLXRvcDogMDtcbn1cblxuc3BhbiB7XG4gICAgZm9udC1zaXplOiAxMnB0O1xuICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xufVxuXG4uZGlzcG9uaWJsZSB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogbGlnaHRncmVlbjtcbn1cblxuLm9jdXBhZGEgeyAgICBcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZGEzMzJkO1xufSJdfQ== */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/mesa/mesa.component.ts": 
        /*!***************************************************************!*\
          !*** ./src/app/restaurante/components/mesa/mesa.component.ts ***!
          \***************************************************************/
        /*! exports provided: MesaComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MesaComponent", function () { return MesaComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/snack-bar */ "./node_modules/@angular/material/esm2015/snack-bar.js");
            /* harmony import */ var _services_mesa_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../services/mesa.service */ "./src/app/restaurante/services/mesa.service.ts");
            var MesaComponent = /** @class */ (function () {
                function MesaComponent(_snackBar, mesaSrvc) {
                    var _this = this;
                    this._snackBar = _snackBar;
                    this.mesaSrvc = mesaSrvc;
                    this.configuracion = {
                        mesa: 0,
                        area: 0,
                        numero: 0,
                        posx: 0.0000,
                        posy: 0.0000,
                        tamanio: 48,
                        estatus: 1
                    };
                    this.dontAllowDrag = true;
                    this.onClickMesa = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
                    this.dragEnded = function (obj) {
                        // console.log(obj);
                        var item = obj.source.element.nativeElement;
                        var parentSize = { x: item.offsetParent.scrollWidth, y: item.offsetParent.scrollHeight };
                        // console.log(`x = ${this.objMesa.offsetLeft}\ny = ${this.objMesa.offsetTop}`);
                        // console.log('Parent = ', parentWidth);
                        var distancia = obj.distance;
                        // console.log(distancia);
                        var updMesa = {
                            mesa: _this.configuracion.mesa,
                            area: _this.configuracion.area,
                            numero: _this.configuracion.numero,
                            posx: (item.offsetLeft + distancia.x) * 100 / parentSize.x,
                            posy: (item.offsetTop + distancia.y) * 100 / parentSize.y,
                            tamanio: _this.configuracion.tamanio,
                            estatus: _this.configuracion.estatus
                        };
                        // console.log(updMesa);
                        _this.mesaSrvc.save(updMesa).subscribe(function (res) {
                            // console.log(res);
                            if (res.exito) {
                                if (!!res.mesa) {
                                    _this.configuracion.mesa = res.mesa.mesa;
                                    _this._snackBar.open("Mesa #" + res.mesa.numero + " actualizada...", 'Diseño de área', { duration: 3000 });
                                }
                                else {
                                    _this._snackBar.open("Mesa #" + _this.configuracion.numero + " actualizada...", 'Diseño de área', { duration: 3000 });
                                }
                            }
                            else {
                                _this._snackBar.open("ERROR:" + res.mensaje + ".", 'Diseño de área', { duration: 3000 });
                            }
                        });
                    };
                }
                MesaComponent.prototype.ngOnInit = function () { };
                MesaComponent.prototype.ngAfterViewInit = function () {
                    this.objMesa = this.divMesa.nativeElement;
                };
                MesaComponent.prototype.clickMesa = function () {
                    this.onClickMesa.emit({ mesaSelected: this.configuracion });
                };
                return MesaComponent;
            }());
            MesaComponent.ctorParameters = function () { return [
                { type: _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_2__["MatSnackBar"] },
                { type: _services_mesa_service__WEBPACK_IMPORTED_MODULE_3__["MesaService"] }
            ]; };
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])()
            ], MesaComponent.prototype, "configuracion", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])()
            ], MesaComponent.prototype, "dontAllowDrag", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"])()
            ], MesaComponent.prototype, "onClickMesa", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('divMesa', { static: false })
            ], MesaComponent.prototype, "divMesa", void 0);
            MesaComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-mesa',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./mesa.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/mesa/mesa.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./mesa.component.css */ "./src/app/restaurante/components/mesa/mesa.component.css")).default]
                })
            ], MesaComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/pide-datos-cuentas/pide-datos-cuentas.component.css": 
        /*!********************************************************************************************!*\
          !*** ./src/app/restaurante/components/pide-datos-cuentas/pide-datos-cuentas.component.css ***!
          \********************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = (".fullWidth { width: 100%; }\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy9waWRlLWRhdG9zLWN1ZW50YXMvcGlkZS1kYXRvcy1jdWVudGFzLmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsYUFBYSxXQUFXLEVBQUUiLCJmaWxlIjoic3JjL2FwcC9yZXN0YXVyYW50ZS9jb21wb25lbnRzL3BpZGUtZGF0b3MtY3VlbnRhcy9waWRlLWRhdG9zLWN1ZW50YXMuY29tcG9uZW50LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5mdWxsV2lkdGggeyB3aWR0aDogMTAwJTsgfSJdfQ== */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/pide-datos-cuentas/pide-datos-cuentas.component.ts": 
        /*!*******************************************************************************************!*\
          !*** ./src/app/restaurante/components/pide-datos-cuentas/pide-datos-cuentas.component.ts ***!
          \*******************************************************************************************/
        /*! exports provided: PideDatosCuentasComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PideDatosCuentasComponent", function () { return PideDatosCuentasComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/esm2015/dialog.js");
            /* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/table */ "./node_modules/@angular/material/esm2015/table.js");
            /* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/snack-bar */ "./node_modules/@angular/material/esm2015/snack-bar.js");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../shared/global */ "./src/app/shared/global.ts");
            /*
            interface ICuenta {
              numero: number;
              nombre: string;
              productos: any[];
            }
            */
            var PideDatosCuentasComponent = /** @class */ (function () {
                function PideDatosCuentasComponent(dialogRef, data, _snackBar, ls) {
                    var _this = this;
                    this.dialogRef = dialogRef;
                    this.data = data;
                    this._snackBar = _snackBar;
                    this.ls = ls;
                    this.displayedColumns = ['numero', 'nombre'];
                    this.esMovil = false;
                    this.terminar = function (obj) {
                        var tcn = _this.todosConNombre(obj);
                        if (tcn < 0) {
                            _this.dialogRef.close(obj);
                        }
                        else {
                            _this._snackBar.open("Favor ingresar nombre a la cuenta #" + obj[tcn].cuenta + "...", 'Cuentas', { duration: 5000 });
                        }
                    };
                    this.setTableDataSource = function () { return _this.dataSource = new _angular_material_table__WEBPACK_IMPORTED_MODULE_3__["MatTableDataSource"](_this.data); };
                }
                PideDatosCuentasComponent.prototype.ngOnInit = function () {
                    this.esMovil = this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_6__["GLOBAL"].usrTokenVar).enmovil || false;
                    this.setTableDataSource();
                };
                PideDatosCuentasComponent.prototype.todosConNombre = function (ctas) {
                    for (var i = 0; i < ctas.length; i++) {
                        if (!ctas[i].nombre) {
                            return i;
                        }
                    }
                    return -1;
                };
                PideDatosCuentasComponent.prototype.agregarFila = function () {
                    this.data.push({
                        cuenta: 0,
                        numero: this.data.length + 1,
                        nombre: null,
                        productos: []
                    });
                    this.dataSource.data = this.data;
                };
                return PideDatosCuentasComponent;
            }());
            PideDatosCuentasComponent.ctorParameters = function () { return [
                { type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MatDialogRef"] },
                { type: Array, decorators: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"], args: [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"],] }] },
                { type: _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_4__["MatSnackBar"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__["LocalstorageService"] }
            ]; };
            PideDatosCuentasComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-pide-datos-cuentas',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./pide-datos-cuentas.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/pide-datos-cuentas/pide-datos-cuentas.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./pide-datos-cuentas.component.css */ "./src/app/restaurante/components/pide-datos-cuentas/pide-datos-cuentas.component.css")).default]
                }),
                tslib__WEBPACK_IMPORTED_MODULE_0__["__param"](1, Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"])(_angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"]))
            ], PideDatosCuentasComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/reportes/propinas/propinas.component.css": 
        /*!*********************************************************************************!*\
          !*** ./src/app/restaurante/components/reportes/propinas/propinas.component.css ***!
          \*********************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3Jlc3RhdXJhbnRlL2NvbXBvbmVudHMvcmVwb3J0ZXMvcHJvcGluYXMvcHJvcGluYXMuY29tcG9uZW50LmNzcyJ9 */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/reportes/propinas/propinas.component.ts": 
        /*!********************************************************************************!*\
          !*** ./src/app/restaurante/components/reportes/propinas/propinas.component.ts ***!
          \********************************************************************************/
        /*! exports provided: PropinasComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PropinasComponent", function () { return PropinasComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
            /* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/ __webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_3__);
            var PropinasComponent = /** @class */ (function () {
                function PropinasComponent() {
                    var _this = this;
                    this.params = {};
                    this.configParams = {
                        isRequiredFDel: true, isRequiredFAl: true
                    };
                    this.configBotones = {
                        isHtmlDisabled: false, isPdfDisabled: false, isExcelDisabled: false
                    };
                    this.resetParams = function () {
                        _this.params = {
                            fdel: moment__WEBPACK_IMPORTED_MODULE_3__().startOf('month').format(_shared_global__WEBPACK_IMPORTED_MODULE_2__["GLOBAL"].dbDateFormat),
                            fal: moment__WEBPACK_IMPORTED_MODULE_3__().endOf('month').format(_shared_global__WEBPACK_IMPORTED_MODULE_2__["GLOBAL"].dbDateFormat)
                        };
                        // console.log(this.params);
                    };
                    this.getReporte = function () {
                        console.log('GENERANDO CON PARAMETROS = ', _this.params);
                    };
                }
                PropinasComponent.prototype.ngOnInit = function () {
                    this.resetParams();
                };
                return PropinasComponent;
            }());
            PropinasComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-propinas',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./propinas.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/propinas/propinas.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./propinas.component.css */ "./src/app/restaurante/components/reportes/propinas/propinas.component.css")).default]
                })
            ], PropinasComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/reportes/rpt-ventas/por-articulo/por-articulo.component.css": 
        /*!****************************************************************************************************!*\
          !*** ./src/app/restaurante/components/reportes/rpt-ventas/por-articulo/por-articulo.component.css ***!
          \****************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = (".numWidth {\r\n    width: 10%;\r\n}\r\n\r\ntr {\r\n    border: none;\r\n}\r\n\r\nth, td {\r\n    padding-top: 0.25em;\r\n    padding-bottom: 0.25em;\r\n}\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy9yZXBvcnRlcy9ycHQtdmVudGFzL3Bvci1hcnRpY3Vsby9wb3ItYXJ0aWN1bG8uY29tcG9uZW50LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtJQUNJLFVBQVU7QUFDZDs7QUFFQTtJQUNJLFlBQVk7QUFDaEI7O0FBRUE7SUFDSSxtQkFBbUI7SUFDbkIsc0JBQXNCO0FBQzFCIiwiZmlsZSI6InNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy9yZXBvcnRlcy9ycHQtdmVudGFzL3Bvci1hcnRpY3Vsby9wb3ItYXJ0aWN1bG8uY29tcG9uZW50LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5udW1XaWR0aCB7XHJcbiAgICB3aWR0aDogMTAlO1xyXG59XHJcblxyXG50ciB7XHJcbiAgICBib3JkZXI6IG5vbmU7XHJcbn1cclxuXHJcbnRoLCB0ZCB7XHJcbiAgICBwYWRkaW5nLXRvcDogMC4yNWVtO1xyXG4gICAgcGFkZGluZy1ib3R0b206IDAuMjVlbTtcclxufSJdfQ== */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/reportes/rpt-ventas/por-articulo/por-articulo.component.ts": 
        /*!***************************************************************************************************!*\
          !*** ./src/app/restaurante/components/reportes/rpt-ventas/por-articulo/por-articulo.component.ts ***!
          \***************************************************************************************************/
        /*! exports provided: PorArticuloComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PorArticuloComponent", function () { return PorArticuloComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            var PorArticuloComponent = /** @class */ (function () {
                function PorArticuloComponent() {
                    this.params = {};
                    this.data = [];
                }
                PorArticuloComponent.prototype.ngOnInit = function () {
                };
                return PorArticuloComponent;
            }());
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])()
            ], PorArticuloComponent.prototype, "params", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])()
            ], PorArticuloComponent.prototype, "data", void 0);
            PorArticuloComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-por-articulo',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./por-articulo.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/rpt-ventas/por-articulo/por-articulo.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./por-articulo.component.css */ "./src/app/restaurante/components/reportes/rpt-ventas/por-articulo/por-articulo.component.css")).default]
                })
            ], PorArticuloComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/reportes/rpt-ventas/por-categoria/por-categoria.component.css": 
        /*!******************************************************************************************************!*\
          !*** ./src/app/restaurante/components/reportes/rpt-ventas/por-categoria/por-categoria.component.css ***!
          \******************************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = (".numWidth {\r\n    width: 10%;\r\n}\r\n\r\ntr {\r\n    border: none;\r\n}\r\n\r\nth, td {\r\n    padding-top: 0.25em;\r\n    padding-bottom: 0.25em;\r\n}\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy9yZXBvcnRlcy9ycHQtdmVudGFzL3Bvci1jYXRlZ29yaWEvcG9yLWNhdGVnb3JpYS5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0lBQ0ksVUFBVTtBQUNkOztBQUVBO0lBQ0ksWUFBWTtBQUNoQjs7QUFFQTtJQUNJLG1CQUFtQjtJQUNuQixzQkFBc0I7QUFDMUIiLCJmaWxlIjoic3JjL2FwcC9yZXN0YXVyYW50ZS9jb21wb25lbnRzL3JlcG9ydGVzL3JwdC12ZW50YXMvcG9yLWNhdGVnb3JpYS9wb3ItY2F0ZWdvcmlhLmNvbXBvbmVudC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIubnVtV2lkdGgge1xyXG4gICAgd2lkdGg6IDEwJTtcclxufVxyXG5cclxudHIge1xyXG4gICAgYm9yZGVyOiBub25lO1xyXG59XHJcblxyXG50aCwgdGQge1xyXG4gICAgcGFkZGluZy10b3A6IDAuMjVlbTtcclxuICAgIHBhZGRpbmctYm90dG9tOiAwLjI1ZW07XHJcbn0iXX0= */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/reportes/rpt-ventas/por-categoria/por-categoria.component.ts": 
        /*!*****************************************************************************************************!*\
          !*** ./src/app/restaurante/components/reportes/rpt-ventas/por-categoria/por-categoria.component.ts ***!
          \*****************************************************************************************************/
        /*! exports provided: PorCategoriaComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PorCategoriaComponent", function () { return PorCategoriaComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            var PorCategoriaComponent = /** @class */ (function () {
                function PorCategoriaComponent() {
                    this.params = {};
                    this.data = [];
                }
                PorCategoriaComponent.prototype.ngOnInit = function () {
                };
                return PorCategoriaComponent;
            }());
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])()
            ], PorCategoriaComponent.prototype, "params", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])()
            ], PorCategoriaComponent.prototype, "data", void 0);
            PorCategoriaComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-por-categoria',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./por-categoria.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/rpt-ventas/por-categoria/por-categoria.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./por-categoria.component.css */ "./src/app/restaurante/components/reportes/rpt-ventas/por-categoria/por-categoria.component.css")).default]
                })
            ], PorCategoriaComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/reportes/rpt-ventas/rpt-ventas.component.css": 
        /*!*************************************************************************************!*\
          !*** ./src/app/restaurante/components/reportes/rpt-ventas/rpt-ventas.component.css ***!
          \*************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3Jlc3RhdXJhbnRlL2NvbXBvbmVudHMvcmVwb3J0ZXMvcnB0LXZlbnRhcy9ycHQtdmVudGFzLmNvbXBvbmVudC5jc3MifQ== */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/reportes/rpt-ventas/rpt-ventas.component.ts": 
        /*!************************************************************************************!*\
          !*** ./src/app/restaurante/components/reportes/rpt-ventas/rpt-ventas.component.ts ***!
          \************************************************************************************/
        /*! exports provided: RptVentasComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RptVentasComponent", function () { return RptVentasComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/snack-bar */ "./node_modules/@angular/material/esm2015/snack-bar.js");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
            /* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/ __webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_4__);
            /* harmony import */ var _services_reporte_ventas_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../services/reporte-ventas.service */ "./src/app/restaurante/services/reporte-ventas.service.ts");
            var RptVentasComponent = /** @class */ (function () {
                function RptVentasComponent(snackBar, rptVentasSrvc) {
                    var _this = this;
                    this.snackBar = snackBar;
                    this.rptVentasSrvc = rptVentasSrvc;
                    this.tiposReporte = [];
                    this.params = {};
                    this.paramsToSend = {};
                    this.msgGenerandoReporte = null;
                    this.porCategoria = [];
                    this.porArticulo = [];
                    this.loadTiposReporte = function () {
                        _this.tiposReporte = [
                            { tipo_reporte: 1, descripcion: 'Por categoría' },
                            { tipo_reporte: 2, descripcion: 'Por artículo' }
                        ];
                    };
                    this.resetParams = function () {
                        _this.porCategoria = [];
                        _this.porArticulo = [];
                        _this.msgGenerandoReporte = null;
                        _this.params = {
                            tipo_reporte: undefined,
                            fdel: moment__WEBPACK_IMPORTED_MODULE_4__().startOf('week').format(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].dbDateFormat),
                            fal: moment__WEBPACK_IMPORTED_MODULE_4__().endOf('week').format(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].dbDateFormat)
                        };
                    };
                    this.getReporte = function (tipo) {
                        if (tipo === void 0) { tipo = 1; }
                        _this.paramsToSend = JSON.parse(JSON.stringify(_this.params));
                        _this.msgGenerandoReporte = 'GENERANDO REPORTE EN ';
                        switch (tipo) {
                            case 1:
                                _this.getEnPantalla();
                                break;
                            case 2:
                                _this.msgGenerandoReporte += 'PDF.';
                                break;
                            case 3:
                                _this.msgGenerandoReporte += 'EXCEL.';
                                break;
                        }
                    };
                    this.getEnPantalla = function () {
                        switch (_this.params.tipo_reporte) {
                            case 1:
                                _this.getPorCategoriaEnPantalla();
                                break;
                            case 2:
                                _this.getPorArticuloEnPantalla();
                                break;
                        }
                    };
                    this.cleanParams = function () { return delete _this.paramsToSend.tipo_reporte; };
                    this.getPorCategoriaEnPantalla = function () {
                        _this.cleanParams();
                        _this.rptVentasSrvc.porCategoria(_this.paramsToSend).subscribe(function (res) {
                            if (res) {
                                _this.porCategoria = res;
                            }
                            else {
                                _this.snackBar.open('No se pudo generar el reporte...', 'Ventas por categoría', { duration: 3000 });
                            }
                        });
                    };
                    this.getPorArticuloEnPantalla = function () {
                        _this.cleanParams();
                        _this.rptVentasSrvc.porArticulo(_this.paramsToSend).subscribe(function (res) {
                            if (res) {
                                _this.porArticulo = res;
                            }
                            else {
                                _this.snackBar.open('No se pudo generar el reporte...', 'Ventas por artículo', { duration: 3000 });
                            }
                        });
                    };
                }
                RptVentasComponent.prototype.ngOnInit = function () {
                    this.resetParams();
                    this.loadTiposReporte();
                };
                return RptVentasComponent;
            }());
            RptVentasComponent.ctorParameters = function () { return [
                { type: _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_2__["MatSnackBar"] },
                { type: _services_reporte_ventas_service__WEBPACK_IMPORTED_MODULE_5__["ReporteVentasService"] }
            ]; };
            RptVentasComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-rpt-ventas',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./rpt-ventas.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/rpt-ventas/rpt-ventas.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./rpt-ventas.component.css */ "./src/app/restaurante/components/reportes/rpt-ventas/rpt-ventas.component.css")).default]
                })
            ], RptVentasComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/reportes/turnos/turnos.component.css": 
        /*!*****************************************************************************!*\
          !*** ./src/app/restaurante/components/reportes/turnos/turnos.component.css ***!
          \*****************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3Jlc3RhdXJhbnRlL2NvbXBvbmVudHMvcmVwb3J0ZXMvdHVybm9zL3R1cm5vcy5jb21wb25lbnQuY3NzIn0= */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/reportes/turnos/turnos.component.ts": 
        /*!****************************************************************************!*\
          !*** ./src/app/restaurante/components/reportes/turnos/turnos.component.ts ***!
          \****************************************************************************/
        /*! exports provided: TurnosComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TurnosComponent", function () { return TurnosComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
            /* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/ __webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_3__);
            var TurnosComponent = /** @class */ (function () {
                function TurnosComponent() {
                    var _this = this;
                    this.params = {};
                    this.configParams = {
                        isRequiredFDel: true, isRequiredFAl: true
                    };
                    this.configBotones = {
                        isHtmlDisabled: false, isPdfDisabled: false, isExcelDisabled: false
                    };
                    this.resetParams = function () {
                        _this.params = {
                            fdel: moment__WEBPACK_IMPORTED_MODULE_3__().startOf('week').format(_shared_global__WEBPACK_IMPORTED_MODULE_2__["GLOBAL"].dbDateFormat),
                            fal: moment__WEBPACK_IMPORTED_MODULE_3__().endOf('week').format(_shared_global__WEBPACK_IMPORTED_MODULE_2__["GLOBAL"].dbDateFormat)
                        };
                        // console.log(this.params);
                    };
                    this.getReporte = function () {
                        console.log('GENERANDO CON PARAMETROS = ', _this.params);
                    };
                }
                TurnosComponent.prototype.ngOnInit = function () {
                    this.resetParams();
                };
                return TurnosComponent;
            }());
            TurnosComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-turnos',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./turnos.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/reportes/turnos/turnos.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./turnos.component.css */ "./src/app/restaurante/components/reportes/turnos/turnos.component.css")).default]
                })
            ], TurnosComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/tran-areas/tran-areas.component.css": 
        /*!****************************************************************************!*\
          !*** ./src/app/restaurante/components/tran-areas/tran-areas.component.css ***!
          \****************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = (".divAreaMesa {\n    width: 100%;\n    height: 700px;\n    background-color: #c7c7c749;\n}\n\nmat-sidenav {\n    width: 75%;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy90cmFuLWFyZWFzL3RyYW4tYXJlYXMuY29tcG9uZW50LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtJQUNJLFdBQVc7SUFDWCxhQUFhO0lBQ2IsMkJBQTJCO0FBQy9COztBQUVBO0lBQ0ksVUFBVTtBQUNkIiwiZmlsZSI6InNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy90cmFuLWFyZWFzL3RyYW4tYXJlYXMuY29tcG9uZW50LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5kaXZBcmVhTWVzYSB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgaGVpZ2h0OiA3MDBweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjYzdjN2M3NDk7XG59XG5cbm1hdC1zaWRlbmF2IHtcbiAgICB3aWR0aDogNzUlO1xufSJdfQ== */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/tran-areas/tran-areas.component.ts": 
        /*!***************************************************************************!*\
          !*** ./src/app/restaurante/components/tran-areas/tran-areas.component.ts ***!
          \***************************************************************************/
        /*! exports provided: TranAreasComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TranAreasComponent", function () { return TranAreasComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/esm2015/dialog.js");
            /* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/snack-bar */ "./node_modules/@angular/material/esm2015/snack-bar.js");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var _abrir_mesa_abrir_mesa_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../abrir-mesa/abrir-mesa.component */ "./src/app/restaurante/components/abrir-mesa/abrir-mesa.component.ts");
            /* harmony import */ var _services_area_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../services/area.service */ "./src/app/restaurante/services/area.service.ts");
            /* harmony import */ var _services_comanda_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../services/comanda.service */ "./src/app/restaurante/services/comanda.service.ts");
            var TranAreasComponent = /** @class */ (function () {
                function TranAreasComponent(dialog, _snackBar, ls, areaSrvc, comandaSrvc) {
                    var _this = this;
                    this.dialog = dialog;
                    this._snackBar = _snackBar;
                    this.ls = ls;
                    this.areaSrvc = areaSrvc;
                    this.comandaSrvc = comandaSrvc;
                    this.divSize = { h: 0, w: 0 };
                    this.lstTabsAreas = [];
                    this.resetMesaSeleccionada = function () { return _this.mesaSeleccionada = {
                        comanda: null, usuario: null, sede: null, estatus: null,
                        mesa: {
                            mesa: null,
                            area: { area: null, sede: null, area_padre: null, nombre: null },
                            numero: null, posx: null, posy: null, tamanio: null, estatus: null
                        },
                        cuentas: []
                    }; };
                    this.loadAreas = function () {
                        _this.areaSrvc.get({ sede: (+_this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_4__["GLOBAL"].usrTokenVar).sede || 0) }).subscribe(function (res) {
                            _this.lstTabsAreas = res;
                        });
                    };
                    this.onResize = function (event) { return _this.setDivSize(); };
                    this.setEstatusMesa = function (m, estatus) {
                        // console.log('Mesa = ', m);
                        // console.log('Estatus solicitado = ', estatus);
                        var idxArea = _this.lstTabsAreas.findIndex(function (a) { return +a.area === +m.area; });
                        // console.log(`Area = ${idxArea}`);
                        if (idxArea > -1) {
                            var idxMesa = _this.lstTabsAreas[idxArea].mesas.findIndex(function (l) { return +l.mesa === +m.mesa; });
                            // console.log(`Mesa = ${idxMesa}`);
                            if (idxMesa > -1) {
                                _this.lstTabsAreas[idxArea].mesas[idxMesa].estatus = estatus;
                            }
                        }
                    };
                    this.toggleRightSidenav = function () { return _this.rightSidenav.toggle(); };
                    this.cerrandoRightSideNav = function () {
                        // console.log('Antes de "resetMesaEnUso"');
                        _this.snTrancomanda.resetMesaEnUso();
                        // console.log('Antes de "resetLstProductosDeCuenta"');
                        _this.snTrancomanda.resetLstProductosDeCuenta();
                        // console.log('Antes de "resetLstProductosSeleccionados"');
                        _this.snTrancomanda.resetLstProductosSeleccionados();
                        // console.log('Antes de "resetCuentaActiva"');
                        _this.snTrancomanda.resetCuentaActiva();
                        // console.log('Antes de "loadComandaMesa"');
                        _this.loadComandaMesa(_this.mesaSeleccionada.mesa, false);
                    };
                    this.checkEstatusMesa = function () {
                        // console.log('MESA = ', this.mesaSeleccionada);
                        if (!!_this.mesaSeleccionada && !!_this.mesaSeleccionada.cuentas && _this.mesaSeleccionada.cuentas.length > 0) {
                            var abiertas = _this.mesaSeleccionada.cuentas.filter(function (cta) { return +cta.cerrada === 0; }).length || 0;
                            // console.log(`ABIERTAS = ${abiertas}`);
                            if (abiertas === 0) {
                                _this.setEstatusMesa({
                                    area: _this.mesaSeleccionada.mesa.area.area,
                                    mesa: _this.mesaSeleccionada.mesa.mesa
                                }, 1);
                            }
                        }
                    };
                    this.loadComandaMesa = function (obj, shouldToggle) {
                        if (shouldToggle === void 0) { shouldToggle = true; }
                        // console.log(obj);
                        _this.comandaSrvc.getComandaDeMesa(obj.mesa).subscribe(function (res) {
                            // console.log(res); return;
                            if (res) {
                                if (!Array.isArray(res)) {
                                    _this.mesaSeleccionada = res;
                                }
                                else {
                                    if (res.length === 0) {
                                        _this.mesaSeleccionada = {
                                            mesa: _this.mesaSeleccionada.mesa,
                                            cuentas: [
                                                { cerrada: 1 }
                                            ]
                                        };
                                    }
                                }
                                _this.checkEstatusMesa();
                                if (shouldToggle) {
                                    _this.snTrancomanda.llenaProductosSeleccionados(_this.mesaSeleccionada);
                                    _this.toggleRightSidenav();
                                }
                            }
                            else {
                                _this._snackBar.open("Problema al mostrar la comanda de la mesa #" + obj.numero, 'ERROR', { duration: 5000 });
                            }
                        });
                    };
                }
                TranAreasComponent.prototype.ngOnInit = function () {
                    this.loadAreas();
                    this.resetMesaSeleccionada();
                };
                TranAreasComponent.prototype.ngAfterViewInit = function () {
                    var _this = this;
                    setTimeout(function () {
                        _this.setDivSize();
                        _this.snTrancomanda.resetMesaEnUso();
                    }, 600);
                };
                TranAreasComponent.prototype.setDivSize = function () {
                    this.divSize.w = this.pestania.nativeElement.offsetWidth;
                    this.divSize.h = this.pestania.nativeElement.offsetHeight;
                };
                TranAreasComponent.prototype.onClickMesa = function (m) {
                    // console.log(m.mesaSelected); return;
                    switch (+m.mesaSelected.estatus) {
                        case 1:
                            this.openAbrirMesaDialog(m.mesaSelected);
                            break;
                        case 2:
                            this.loadComandaMesa(m.mesaSelected);
                            break;
                    }
                };
                TranAreasComponent.prototype.openAbrirMesaDialog = function (m) {
                    var _this = this;
                    this.mesaSeleccionadaToOpen = {
                        nombreArea: this.tabArea.textLabel,
                        area: +m.area,
                        mesa: +m.mesa,
                        numero: +m.numero,
                        mesero: '',
                        comensales: '1',
                        comanda: 0,
                        esEvento: false,
                        dividirCuentasPorSillas: false,
                        estatus: 1,
                        cuentas: [
                            {
                                numero: 1,
                                nombre: 'Única',
                                productos: []
                            }
                        ]
                    };
                    var abrirMesaRef = this.dialog.open(_abrir_mesa_abrir_mesa_component__WEBPACK_IMPORTED_MODULE_6__["AbrirMesaComponent"], {
                        width: '250px',
                        disableClose: true,
                        data: this.mesaSeleccionadaToOpen
                    });
                    abrirMesaRef.afterClosed().subscribe(function (result) {
                        if (result) {
                            _this.mesaSeleccionadaToOpen = result;
                            // console.log(JSON.stringify(this.mesaSeleccionada));
                            _this.comandaSrvc.save(_this.mesaSeleccionadaToOpen).subscribe(function (res) {
                                // console.log(res);
                                if (res.exito) {
                                    _this.mesaSeleccionada = res.comanda;
                                    // console.log('m', m);
                                    _this.setEstatusMesa(m, +res.comanda.mesa.estatus);
                                    _this.toggleRightSidenav();
                                }
                                else {
                                    _this._snackBar.open("" + res.mensaje, 'ERROR', { duration: 5000 });
                                }
                            });
                        }
                    });
                };
                return TranAreasComponent;
            }());
            TranAreasComponent.ctorParameters = function () { return [
                { type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MatDialog"] },
                { type: _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_3__["MatSnackBar"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__["LocalstorageService"] },
                { type: _services_area_service__WEBPACK_IMPORTED_MODULE_7__["AreaService"] },
                { type: _services_comanda_service__WEBPACK_IMPORTED_MODULE_8__["ComandaService"] }
            ]; };
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('matTabArea', { static: false })
            ], TranAreasComponent.prototype, "pestania", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('rightSidenav', { static: false })
            ], TranAreasComponent.prototype, "rightSidenav", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('tabArea', { static: false })
            ], TranAreasComponent.prototype, "tabArea", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('snTranComanda', { static: false })
            ], TranAreasComponent.prototype, "snTrancomanda", void 0);
            TranAreasComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-tran-areas',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./tran-areas.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/tran-areas/tran-areas.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./tran-areas.component.css */ "./src/app/restaurante/components/tran-areas/tran-areas.component.css")).default]
                })
            ], TranAreasComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/tran-comanda/tran-comanda.component.css": 
        /*!********************************************************************************!*\
          !*** ./src/app/restaurante/components/tran-comanda/tran-comanda.component.css ***!
          \********************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = (".matSideNavContainer {\n    height: 100%;\n}\n\n.divFullSize {\n    width: 100%;\n    height: 650px;\n}\n\n.col {\n    padding-top: 1px;\n    padding-bottom: 1px;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy90cmFuLWNvbWFuZGEvdHJhbi1jb21hbmRhLmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7SUFDSSxZQUFZO0FBQ2hCOztBQUVBO0lBQ0ksV0FBVztJQUNYLGFBQWE7QUFDakI7O0FBRUE7SUFDSSxnQkFBZ0I7SUFDaEIsbUJBQW1CO0FBQ3ZCIiwiZmlsZSI6InNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy90cmFuLWNvbWFuZGEvdHJhbi1jb21hbmRhLmNvbXBvbmVudC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIubWF0U2lkZU5hdkNvbnRhaW5lciB7XG4gICAgaGVpZ2h0OiAxMDAlO1xufVxuXG4uZGl2RnVsbFNpemUge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogNjUwcHg7XG59XG5cbi5jb2wge1xuICAgIHBhZGRpbmctdG9wOiAxcHg7XG4gICAgcGFkZGluZy1ib3R0b206IDFweDtcbn0iXX0= */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/tran-comanda/tran-comanda.component.ts": 
        /*!*******************************************************************************!*\
          !*** ./src/app/restaurante/components/tran-comanda/tran-comanda.component.ts ***!
          \*******************************************************************************/
        /*! exports provided: TranComandaComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TranComandaComponent", function () { return TranComandaComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm2015/router.js");
            /* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/esm2015/dialog.js");
            /* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/snack-bar */ "./node_modules/@angular/material/esm2015/snack-bar.js");
            /* harmony import */ var ngx_socket_io__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ngx-socket-io */ "./node_modules/ngx-socket-io/fesm2015/ngx-socket-io.js");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var _unir_cuenta_unir_cuenta_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../unir-cuenta/unir-cuenta.component */ "./src/app/restaurante/components/unir-cuenta/unir-cuenta.component.ts");
            /* harmony import */ var _pos_components_cobrar_pedido_cobrar_pedido_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../pos/components/cobrar-pedido/cobrar-pedido.component */ "./src/app/pos/components/cobrar-pedido/cobrar-pedido.component.ts");
            /* harmony import */ var _services_comanda_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../services/comanda.service */ "./src/app/restaurante/services/comanda.service.ts");
            // import { SignalRService } from '../../../shared/services/signal-r.service';
            var TranComandaComponent = /** @class */ (function () {
                function TranComandaComponent(router, dialog, _snackBar, comandaSrvc, socket, 
                // private signalRSrvc: SignalRService
                ls) {
                    var _this = this;
                    this.router = router;
                    this.dialog = dialog;
                    this._snackBar = _snackBar;
                    this.comandaSrvc = comandaSrvc;
                    this.socket = socket;
                    this.ls = ls;
                    // public noCuentaSeleccionada: number = null;
                    this.showPortalComanda = false;
                    this.showPortalCuenta = false;
                    this.noComanda = 0;
                    this.sumCuenta = 0;
                    this.resetMesaEnUso = function () { return _this.mesaEnUso = {
                        comanda: null, usuario: null, sede: null, estatus: null,
                        mesa: {
                            mesa: null,
                            area: { area: null, sede: null, area_padre: null, nombre: null },
                            numero: null, posx: null, posy: null, tamanio: null, estatus: null
                        },
                        cuentas: []
                    }; };
                    this.resetLstProductosSeleccionados = function () { return _this.lstProductosSeleccionados = []; };
                    this.resetLstProductosDeCuenta = function () { return _this.lstProductosDeCuenta = []; };
                    this.resetCuentaActiva = function () { return _this.cuentaActiva = { cuenta: null, numero: null, nombre: null, productos: [] }; };
                    this.llenaProductosSeleccionados = function (conQueMesa) {
                        if (conQueMesa === void 0) { conQueMesa = _this.mesaEnUso; }
                        _this.lstProductosSeleccionados = [];
                        for (var i = 0; i < conQueMesa.cuentas.length; i++) {
                            var cta = conQueMesa.cuentas[i];
                            for (var j = 0; j < cta.productos.length; j++) {
                                var p = cta.productos[j];
                                // console.log(p);
                                _this.lstProductosSeleccionados.push({
                                    id: +p.articulo.articulo,
                                    nombre: p.articulo.descripcion,
                                    cuenta: +p.numero_cuenta || 1,
                                    cantidad: +p.cantidad,
                                    impreso: +p.impreso,
                                    precio: parseFloat(p.precio) || 10.00,
                                    total: parseFloat(p.total) || (parseFloat(p.cantidad) * parseFloat(p.precio)),
                                    notas: p.notas || '',
                                    showInputNotas: false,
                                    itemListHeight: '70px',
                                    detalle_comanda: +p.detalle_comanda,
                                    detalle_cuenta: +p.detalle_cuenta,
                                    impresora: p.articulo.impresora
                                });
                            }
                        }
                        // console.log('SELECCIONADOS = ', this.lstProductosSeleccionados);
                    };
                    this.printToBT = function (msgToPrint) {
                        if (msgToPrint === void 0) { msgToPrint = ''; }
                        /*
                        const a = document.createElement('a');
                        document.body.appendChild(a);
                        a.href = `'com.restouch.impresion://impresion/${msgToPrint}'`;
                        a.onclick = (e) => { e.preventDefault(); };
                        a.click();
                        */
                        var AppHref = "com.restouch.impresion://impresion/" + msgToPrint;
                        var wref = window.open(AppHref, 'PrntBT', 'height=200,width=200,menubar=no,location=no,resizable=no,scrollbars=no,status=no');
                        setTimeout(function () { return wref.close(); }, 1000);
                    };
                    this.sumaDetalle = function (detalle) {
                        var total = 0.00;
                        for (var i = 0; i < detalle.length; i++) {
                            total += detalle[i].total || 0.00;
                        }
                        return total;
                    };
                    this.cambiarEstatusCuenta = function (obj) {
                        var idxCta = _this.mesaEnUso.cuentas.findIndex(function (c) { return +c.cuenta === +obj.cuenta; });
                        _this.mesaEnUso.cuentas[idxCta].cerrada = +obj.cerrada;
                    };
                }
                TranComandaComponent.prototype.ngOnInit = function () {
                    this.resetMesaEnUso();
                    this.resetLstProductosSeleccionados();
                    this.resetLstProductosDeCuenta();
                    this.resetCuentaActiva();
                    this.noComanda = this.mesaEnUso.comanda || 0;
                    this.llenaProductosSeleccionados();
                    // this.signalRSrvc.startConnection(`restaurante_01`);
                    // this.signalRSrvc.addBroadcastDataListener();
                    if (!!this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_7__["GLOBAL"].usrTokenVar).sede_uuid) {
                        this.socket.emit('joinRestaurant', this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_7__["GLOBAL"].usrTokenVar).sede_uuid);
                    }
                };
                TranComandaComponent.prototype.setSelectedCuenta = function (noCuenta) {
                    this.cuentaActiva = this.mesaEnUso.cuentas.find(function (c) { return +c.numero === +noCuenta; });
                    this.setLstProductosDeCuenta();
                };
                TranComandaComponent.prototype.setSumaCuenta = function (lista) {
                    var suma = 0.00;
                    for (var i = 0; i < lista.length; i++) {
                        suma += (lista[i].precio * lista[i].cantidad);
                    }
                    this.sumCuenta = suma;
                };
                TranComandaComponent.prototype.setLstProductosDeCuenta = function () {
                    var _this = this;
                    this.lstProductosDeCuenta = this.lstProductosSeleccionados.filter(function (p) { return p.cuenta == +_this.cuentaActiva.numero; });
                    // console.log(this.lstProductosDeCuenta);
                };
                TranComandaComponent.prototype.addProductoSelected = function (producto) {
                    var _this = this;
                    // console.log(producto); return;
                    if (+this.cuentaActiva.numero) {
                        var idx = this.lstProductosSeleccionados
                            .findIndex(function (p) { return p.id == producto.id && p.cuenta == +_this.cuentaActiva.numero && +p.impreso === 0; });
                        if (idx < 0) {
                            this.detalleComanda = {
                                articulo: producto.id, cantidad: 1, precio: producto.precio, total: 1 * producto.precio, notas: ''
                            };
                            this.comandaSrvc.saveDetalle(this.mesaEnUso.comanda, this.cuentaActiva.cuenta, this.detalleComanda).subscribe(function (res) {
                                //console.log('DETALLE COMANDA = ', res);
                                if (res.exito) {
                                    /*
                                    this.lstProductosSeleccionados.push({
                                      id: producto.id, nombre: producto.nombre, cuenta: +this.cuentaActiva.numero, cantidad: 1, impreso: 0,
                                      precio: producto.precio, notas: '', showInputNotas: false, itemListHeight: '70px', total: 1 * producto.precio,
                                      impresora: producto.impresora
                                    });
                                    */
                                    _this.mesaEnUso = res.comanda;
                                    _this.llenaProductosSeleccionados(_this.mesaEnUso);
                                    _this.setSelectedCuenta(+_this.cuentaActiva.numero);
                                }
                                else {
                                    _this._snackBar.open("ERROR:" + res.mensaje, 'Comanda', { duration: 3000 });
                                }
                            });
                        }
                        else {
                            var tmp = this.lstProductosSeleccionados[idx];
                            this.detalleComanda = {
                                detalle_cuenta: tmp.detalle_cuenta, detalle_comanda: tmp.detalle_comanda, articulo: tmp.id, cantidad: (+tmp.cantidad) + 1,
                                precio: +tmp.precio, total: ((+tmp.cantidad) + 1) * (+tmp.precio), notas: tmp.notas
                            };
                            this.comandaSrvc.saveDetalle(this.mesaEnUso.comanda, this.cuentaActiva.cuenta, this.detalleComanda).subscribe(function (res) {
                                // console.log('UPDATE DETALLE COMANDA = ', res);
                                if (res.exito) {
                                    /*
                                    this.lstProductosSeleccionados[idx].cantidad++;
                                    this.lstProductosSeleccionados[idx].total =
                                      this.lstProductosSeleccionados[idx].cantidad * this.lstProductosSeleccionados[idx].precio;
                                    */
                                    _this.mesaEnUso = res.comanda;
                                    _this.llenaProductosSeleccionados(_this.mesaEnUso);
                                    _this.setSelectedCuenta(+_this.cuentaActiva.numero);
                                }
                                else {
                                    _this._snackBar.open("ERROR:" + res.mensaje, 'Comanda', { duration: 3000 });
                                }
                            });
                        }
                        this.setLstProductosDeCuenta();
                    }
                };
                TranComandaComponent.prototype.updProductosCuenta = function (nvaLista) {
                    var _this = this;
                    if (nvaLista === void 0) { nvaLista = []; }
                    var lstTemp = this.lstProductosSeleccionados.filter(function (p) { return p.cuenta != +_this.cuentaActiva.numero; });
                    if (nvaLista.length > 0) {
                        this.lstProductosSeleccionados = lstTemp.concat(nvaLista);
                    }
                    else {
                        this.lstProductosSeleccionados = lstTemp;
                    }
                };
                TranComandaComponent.prototype.prepProductosComanda = function (prods) {
                    // console.log(prods);
                    var tmp = [];
                    for (var i = 0; i < prods.length; i++) {
                        tmp.push({
                            articulo: prods[i].id,
                            cantidad: prods[i].cantidad,
                            precio: prods[i].precio,
                            total: prods[i].total,
                            notas: prods[i].notas,
                            impreso: 1,
                            detalle_comanda: prods[i].detalle_comanda,
                            detalle_cuenta: prods[i].detalle_cuenta,
                        });
                    }
                    return tmp;
                };
                TranComandaComponent.prototype.printComanda = function () {
                    var _this = this;
                    this.lstProductosAImprimir = this.lstProductosDeCuenta.filter(function (p) { return +p.impreso === 0 && +p.cantidad > 0; });
                    if (this.lstProductosAImprimir.length > 0) {
                        this.lstProductosDeCuenta.map(function (p) { return p.impreso = 1; });
                        this.noComanda = this.mesaEnUso.comanda;
                        this.windowConfig = { width: 325, height: 550, left: 200, top: 200, menubar: 'no', resizable: 'no', titlebar: 'no', toolbar: 'no' };
                        // this.showPortalComanda = true;
                        this.cuentaActiva.productos = this.prepProductosComanda(this.lstProductosDeCuenta);
                        var idxCta = this.mesaEnUso.cuentas.findIndex(function (c) { return +c.cuenta === +_this.cuentaActiva.cuenta; });
                        if (idxCta > -1) {
                            this.mesaEnUso.cuentas[idxCta] = this.cuentaActiva;
                            var objCmd = {
                                area: this.mesaEnUso.mesa.area.area,
                                mesa: this.mesaEnUso.mesa.mesa,
                                mesero: this.mesaEnUso.usuario,
                                comanda: this.mesaEnUso.comanda,
                                cuentas: this.mesaEnUso.cuentas
                            };
                            this.comandaSrvc.save(objCmd).subscribe(function (res) {
                                if (res.exito) {
                                    _this.comandaSrvc.setProductoImpreso(_this.cuentaActiva.cuenta).subscribe(function (resImp) {
                                        _this.llenaProductosSeleccionados(resImp.comanda);
                                        _this.setSelectedCuenta(_this.cuentaActiva.numero);
                                        _this._snackBar.open('Cuenta actualizada', "Cuenta #" + _this.cuentaActiva.numero, { duration: 3000 });
                                    });
                                }
                                else {
                                    _this._snackBar.open("ERROR: " + res.mensaje, "Cuenta #" + _this.cuentaActiva.numero, { duration: 3000 });
                                }
                            });
                        }
                        /*
                        const msgToSocket = JSON.stringify({
                          Tipo: 'Comanda',
                          Nombre: this.cuentaActiva.nombre,
                          Numero: this.noComanda,
                          DetalleCuenta: this.lstProductosAImprimir,
                          Total: null
                        });
                        console.log('MENSAJE = ', msgToSocket);
                        */
                        var AImpresoraNormal = this.lstProductosAImprimir.filter(function (p) { return +p.impresora.bluetooth === 0; });
                        var AImpresoraBT = this.lstProductosAImprimir.filter(function (p) { return +p.impresora.bluetooth === 1; });
                        if (AImpresoraNormal.length > 0) {
                            this.socket.emit('print:comanda', "" + JSON.stringify({
                                Tipo: 'Comanda',
                                Nombre: this.cuentaActiva.nombre,
                                Numero: this.noComanda,
                                DetalleCuenta: AImpresoraNormal,
                                Total: null
                            }));
                        }
                        if (AImpresoraBT.length > 0) {
                            this.printToBT(JSON.stringify({
                                Tipo: 'Comanda',
                                Nombre: this.cuentaActiva.nombre,
                                Numero: this.noComanda,
                                DetalleCuenta: AImpresoraBT,
                                Total: null
                            }));
                        }
                    }
                    else {
                        this._snackBar.open('Nada para enviar...', "Cuenta #" + this.cuentaActiva.numero, { duration: 3000 });
                    }
                };
                TranComandaComponent.prototype.printCuenta = function () {
                    this.lstProductosAImprimir = this.lstProductosDeCuenta.filter(function (p) { return +p.impreso === 1; });
                    this.setSumaCuenta(this.lstProductosAImprimir);
                    this.windowConfig = { width: 325, height: 550, left: 200, top: 200, menubar: 'no', resizable: 'no', titlebar: 'no', toolbar: 'no' };
                    // this.showPortalCuenta = true;
                    /*
                    this.signalRSrvc.broadcastData(`restaurante_01`, `${JSON.stringify({
                      Tipo: 'Cuenta',
                      Nombre: this.cuentaActiva.nombre,
                      Numero: null,
                      DetalleCuenta: this.lstProductosAImprimir,
                      Total: this.sumaDetalle(this.lstProductosAImprimir)
                    })}`);
                    */
                    /*
                    const msgToSocket = JSON.stringify({
                      Tipo: 'Cuenta',
                      Nombre: this.cuentaActiva.nombre,
                      Numero: null,
                      DetalleCuenta: this.lstProductosAImprimir,
                      Total: this.sumaDetalle(this.lstProductosAImprimir)
                    });
                    console.log('MENSAJE = ', msgToSocket);
                    */
                    this.socket.emit("print:cuenta", "" + JSON.stringify({
                        Tipo: 'Cuenta',
                        Nombre: this.cuentaActiva.nombre,
                        Numero: null,
                        DetalleCuenta: this.lstProductosAImprimir,
                        Total: this.sumaDetalle(this.lstProductosAImprimir)
                    }));
                };
                TranComandaComponent.prototype.unirCuentas = function () {
                    var _this = this;
                    var unirCuentaRef = this.dialog.open(_unir_cuenta_unir_cuenta_component__WEBPACK_IMPORTED_MODULE_8__["UnirCuentaComponent"], {
                        width: '55%',
                        data: { lstProductosSeleccionados: this.lstProductosSeleccionados, mesaEnUso: this.mesaEnUso }
                    });
                    unirCuentaRef.afterClosed().subscribe(function (result) {
                        if (result) {
                            _this.lstProductosSeleccionados = result;
                            _this.setLstProductosDeCuenta();
                        }
                    });
                };
                TranComandaComponent.prototype.cobrarCuenta = function () {
                    var _this = this;
                    var productosACobrar = this.lstProductosDeCuenta.filter(function (p) { return +p.impreso === 1; });
                    if (productosACobrar.length > 0) {
                        var cobrarCtaRef = this.dialog.open(_pos_components_cobrar_pedido_cobrar_pedido_component__WEBPACK_IMPORTED_MODULE_9__["CobrarPedidoComponent"], {
                            width: '95%',
                            data: {
                                cuenta: this.cuentaActiva.nombre,
                                idcuenta: this.cuentaActiva.cuenta,
                                productosACobrar: productosACobrar,
                                porcentajePropina: 10
                            }
                        });
                        cobrarCtaRef.afterClosed().subscribe(function (res) {
                            if (res) {
                                // console.log(res);
                                _this.cambiarEstatusCuenta(res);
                                // this.socket.emit('print:doccontable', JSON.stringify(res));
                            }
                        });
                    }
                    else {
                        this._snackBar.open('Cobro', 'Sin productos a cobrar.', { duration: 3000 });
                    }
                };
                return TranComandaComponent;
            }());
            TranComandaComponent.ctorParameters = function () { return [
                { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] },
                { type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_3__["MatDialog"] },
                { type: _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_4__["MatSnackBar"] },
                { type: _services_comanda_service__WEBPACK_IMPORTED_MODULE_10__["ComandaService"] },
                { type: ngx_socket_io__WEBPACK_IMPORTED_MODULE_5__["Socket"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_6__["LocalstorageService"] }
            ]; };
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])()
            ], TranComandaComponent.prototype, "mesaEnUso", void 0);
            TranComandaComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-tran-comanda',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./tran-comanda.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/tran-comanda/tran-comanda.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./tran-comanda.component.css */ "./src/app/restaurante/components/tran-comanda/tran-comanda.component.css")).default]
                })
            ], TranComandaComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/turno/form-turno/form-turno.component.css": 
        /*!**********************************************************************************!*\
          !*** ./src/app/restaurante/components/turno/form-turno/form-turno.component.css ***!
          \**********************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = (".full-width {\n    width: 100%;\n}\n\n.iconFontSize {\n    font-size: 24pt;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy90dXJuby9mb3JtLXR1cm5vL2Zvcm0tdHVybm8uY29tcG9uZW50LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtJQUNJLFdBQVc7QUFDZjs7QUFFQTtJQUNJLGVBQWU7QUFDbkIiLCJmaWxlIjoic3JjL2FwcC9yZXN0YXVyYW50ZS9jb21wb25lbnRzL3R1cm5vL2Zvcm0tdHVybm8vZm9ybS10dXJuby5jb21wb25lbnQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmZ1bGwtd2lkdGgge1xuICAgIHdpZHRoOiAxMDAlO1xufVxuXG4uaWNvbkZvbnRTaXplIHtcbiAgICBmb250LXNpemU6IDI0cHQ7XG59Il19 */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/turno/form-turno/form-turno.component.ts": 
        /*!*********************************************************************************!*\
          !*** ./src/app/restaurante/components/turno/form-turno/form-turno.component.ts ***!
          \*********************************************************************************/
        /*! exports provided: FormTurnoComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormTurnoComponent", function () { return FormTurnoComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/snack-bar */ "./node_modules/@angular/material/esm2015/snack-bar.js");
            /* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/table */ "./node_modules/@angular/material/esm2015/table.js");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var _shared_components_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../shared/components/confirm-dialog/confirm-dialog.component */ "./src/app/shared/components/confirm-dialog/confirm-dialog.component.ts");
            /* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm2015/material.js");
            /* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
            /* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/ __webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_8__);
            /* harmony import */ var _services_tipo_turno_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../services/tipo-turno.service */ "./src/app/restaurante/services/tipo-turno.service.ts");
            /* harmony import */ var _services_turno_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../services/turno.service */ "./src/app/restaurante/services/turno.service.ts");
            /* harmony import */ var _admin_services_usuario_tipo_service__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../admin/services/usuario-tipo.service */ "./src/app/admin/services/usuario-tipo.service.ts");
            /* harmony import */ var _admin_services_usuario_service__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../../admin/services/usuario.service */ "./src/app/admin/services/usuario.service.ts");
            var FormTurnoComponent = /** @class */ (function () {
                function FormTurnoComponent(_snackBar, ls, tipoTurnoSrvc, turnoSrvc, usuarioTipoSrvc, usuarioSrvc, dialog) {
                    var _this = this;
                    this._snackBar = _snackBar;
                    this.ls = ls;
                    this.tipoTurnoSrvc = tipoTurnoSrvc;
                    this.turnoSrvc = turnoSrvc;
                    this.usuarioTipoSrvc = usuarioTipoSrvc;
                    this.usuarioSrvc = usuarioSrvc;
                    this.dialog = dialog;
                    this.turnoSavedEv = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
                    this.showTurnoForm = true;
                    this.showDetalleTurnoForm = true;
                    this.detallesTurno = [];
                    this.displayedColumns = ['usuario_tipo', 'usuario', 'editItem'];
                    this.tiposTurno = [];
                    this.tiposUsuario = [];
                    this.usuarios = [];
                    this.esMovil = false;
                    this.loadTiposTurno = function () {
                        _this.tipoTurnoSrvc.get().subscribe(function (res) {
                            if (res) {
                                _this.tiposTurno = res;
                            }
                        });
                    };
                    this.loadTiposUsuario = function () {
                        _this.usuarioTipoSrvc.get().subscribe(function (res) {
                            if (res) {
                                _this.tiposUsuario = res;
                            }
                        });
                    };
                    this.loadUsuarios = function () {
                        _this.usuarioSrvc.get({ sede: (_this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_5__["GLOBAL"].usrTokenVar).sede || 0) }).subscribe(function (res) {
                            if (res) {
                                _this.usuarios = res;
                            }
                        });
                    };
                    this.resetTurno = function () {
                        _this.turno = {
                            turno: null, turno_tipo: null, inicio: moment__WEBPACK_IMPORTED_MODULE_8__().format(_shared_global__WEBPACK_IMPORTED_MODULE_5__["GLOBAL"].dbDateTimeFormat), fin: null
                        };
                        _this.resetDetalleTurno();
                    };
                    this.saveInfoTurno = function () {
                        _this.turnoSrvc.save(_this.turno).subscribe(function (res) {
                            if (res.exito) {
                                _this.turnoSavedEv.emit();
                                _this.resetTurno();
                                _this.turno = res.turno;
                                _this._snackBar.open('Se abrió un turno nuevo...', 'Turno', { duration: 3000 });
                            }
                            else {
                                _this._snackBar.open("ERROR: " + res.mensaje, 'Turno', { duration: 3000 });
                            }
                        });
                    };
                    this.onSubmit = function () {
                        if (!!_this.turno.fin) {
                            var dialogRef = _this.dialog.open(_shared_components_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_6__["ConfirmDialogComponent"], {
                                maxWidth: "400px",
                                data: new _shared_components_confirm_dialog_confirm_dialog_component__WEBPACK_IMPORTED_MODULE_6__["ConfirmDialogModel"]('Cerrar turno', 'La fecha de finalización cerrará el turno. ¿Desea continuar?', 'Sí', 'No')
                            });
                            dialogRef.afterClosed().subscribe(function (res) {
                                if (res) {
                                    _this.saveInfoTurno();
                                }
                            });
                        }
                        else {
                            _this.saveInfoTurno();
                        }
                    };
                    this.resetDetalleTurno = function () { return _this.detalleTurno = { turno: !!_this.turno.turno ? _this.turno.turno : null, usuario: null, usuario_tipo: null }; };
                    this.loadDetalleTurno = function (idturno) {
                        if (idturno === void 0) { idturno = +_this.turno.turno; }
                        _this.turnoSrvc.getDetalle(idturno, { turno: idturno }).subscribe(function (res) {
                            //console.log(res);
                            if (res) {
                                _this.detallesTurno = res;
                                _this.updateTableDataSource();
                            }
                        });
                    };
                    this.onSubmitDetail = function () {
                        _this.detalleTurno.turno = _this.turno.turno;
                        //console.log(this.detalleTurno); return;
                        _this.turnoSrvc.saveDetalle(_this.detalleTurno).subscribe(function (res) {
                            //console.log(res);
                            if (res.exito) {
                                _this.loadDetalleTurno();
                                _this.resetDetalleTurno();
                                _this._snackBar.open('Usuario agregado al turno...', 'Turno', { duration: 3000 });
                            }
                            else {
                                _this._snackBar.open("ERROR: " + res.mensaje, 'Turno', { duration: 3000 });
                            }
                        });
                    };
                    this.anularDetalleTurno = function (obj) {
                        // console.log(obj);
                        _this.turnoSrvc.anularDetalle({ turno: obj.turno, usuario: obj.usuario.usuario, usuario_tipo: obj.usuario_tipo.usuario_tipo }).subscribe(function (res) {
                            // console.log(res);
                            if (res.exito) {
                                _this.loadDetalleTurno();
                                _this.resetDetalleTurno();
                                _this._snackBar.open('Se quitó al usuario del turno...', 'Turno', { duration: 3000 });
                            }
                            else {
                                _this._snackBar.open("ERROR: " + res.mensaje, 'Turno', { duration: 3000 });
                            }
                        });
                    };
                    this.updateTableDataSource = function () { return _this.dataSource = new _angular_material_table__WEBPACK_IMPORTED_MODULE_3__["MatTableDataSource"](_this.detallesTurno); };
                }
                FormTurnoComponent.prototype.ngOnInit = function () {
                    this.esMovil = this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_5__["GLOBAL"].usrTokenVar).enmovil || false;
                    this.resetTurno();
                    this.loadTiposTurno();
                    this.loadTiposUsuario();
                    this.loadUsuarios();
                };
                return FormTurnoComponent;
            }());
            FormTurnoComponent.ctorParameters = function () { return [
                { type: _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_2__["MatSnackBar"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_4__["LocalstorageService"] },
                { type: _services_tipo_turno_service__WEBPACK_IMPORTED_MODULE_9__["TipoTurnoService"] },
                { type: _services_turno_service__WEBPACK_IMPORTED_MODULE_10__["TurnoService"] },
                { type: _admin_services_usuario_tipo_service__WEBPACK_IMPORTED_MODULE_11__["UsuarioTipoService"] },
                { type: _admin_services_usuario_service__WEBPACK_IMPORTED_MODULE_12__["UsuarioService"] },
                { type: _angular_material__WEBPACK_IMPORTED_MODULE_7__["MatDialog"] }
            ]; };
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Input"])()
            ], FormTurnoComponent.prototype, "turno", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"])()
            ], FormTurnoComponent.prototype, "turnoSavedEv", void 0);
            FormTurnoComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-form-turno',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./form-turno.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/turno/form-turno/form-turno.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./form-turno.component.css */ "./src/app/restaurante/components/turno/form-turno/form-turno.component.css")).default]
                })
            ], FormTurnoComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/turno/lista-turno/lista-turno.component.css": 
        /*!************************************************************************************!*\
          !*** ./src/app/restaurante/components/turno/lista-turno/lista-turno.component.css ***!
          \************************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = (".fullWidth {\n    width: 100% !important;\n}\n\ntable {\n    width: 100% !important;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy90dXJuby9saXN0YS10dXJuby9saXN0YS10dXJuby5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0lBQ0ksc0JBQXNCO0FBQzFCOztBQUVBO0lBQ0ksc0JBQXNCO0FBQzFCIiwiZmlsZSI6InNyYy9hcHAvcmVzdGF1cmFudGUvY29tcG9uZW50cy90dXJuby9saXN0YS10dXJuby9saXN0YS10dXJuby5jb21wb25lbnQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmZ1bGxXaWR0aCB7XG4gICAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDtcbn1cblxudGFibGUge1xuICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XG59Il19 */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/turno/lista-turno/lista-turno.component.ts": 
        /*!***********************************************************************************!*\
          !*** ./src/app/restaurante/components/turno/lista-turno/lista-turno.component.ts ***!
          \***********************************************************************************/
        /*! exports provided: ListaTurnoComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ListaTurnoComponent", function () { return ListaTurnoComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/paginator */ "./node_modules/@angular/material/esm2015/paginator.js");
            /* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/table */ "./node_modules/@angular/material/esm2015/table.js");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var _services_turno_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../services/turno.service */ "./src/app/restaurante/services/turno.service.ts");
            var ListaTurnoComponent = /** @class */ (function () {
                function ListaTurnoComponent(ls, turnoSrvc) {
                    var _this = this;
                    this.ls = ls;
                    this.turnoSrvc = turnoSrvc;
                    this.displayedColumns = ['turno'];
                    this.getTurnoEv = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
                    this.loadTurnos = function () {
                        _this.turnoSrvc.get({ sede: (+_this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_4__["GLOBAL"].usrTokenVar).sede || 0) }).subscribe(function (lst) {
                            if (lst) {
                                if (lst.length > 0) {
                                    _this.lstTurnos = lst;
                                    _this.dataSource = new _angular_material_table__WEBPACK_IMPORTED_MODULE_3__["MatTableDataSource"](_this.lstTurnos);
                                    _this.dataSource.paginator = _this.paginator;
                                }
                            }
                        });
                    };
                    this.getTurno = function (obj) {
                        _this.getTurnoEv.emit({
                            turno: obj.turno,
                            turno_tipo: obj.turno_tipo.turno_tipo,
                            fecha: obj.fecha,
                            inicio: obj.inicio,
                            fin: obj.fin
                        });
                    };
                }
                ListaTurnoComponent.prototype.ngOnInit = function () {
                    this.loadTurnos();
                };
                ListaTurnoComponent.prototype.applyFilter = function (filterValue) {
                    this.dataSource.filter = filterValue.trim().toLowerCase();
                };
                return ListaTurnoComponent;
            }());
            ListaTurnoComponent.ctorParameters = function () { return [
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__["LocalstorageService"] },
                { type: _services_turno_service__WEBPACK_IMPORTED_MODULE_6__["TurnoService"] }
            ]; };
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Output"])()
            ], ListaTurnoComponent.prototype, "getTurnoEv", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])(_angular_material_paginator__WEBPACK_IMPORTED_MODULE_2__["MatPaginator"], { static: true })
            ], ListaTurnoComponent.prototype, "paginator", void 0);
            ListaTurnoComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-lista-turno',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./lista-turno.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/turno/lista-turno/lista-turno.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./lista-turno.component.css */ "./src/app/restaurante/components/turno/lista-turno/lista-turno.component.css")).default]
                })
            ], ListaTurnoComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/turno/turno/turno.component.css": 
        /*!************************************************************************!*\
          !*** ./src/app/restaurante/components/turno/turno/turno.component.css ***!
          \************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3Jlc3RhdXJhbnRlL2NvbXBvbmVudHMvdHVybm8vdHVybm8vdHVybm8uY29tcG9uZW50LmNzcyJ9 */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/turno/turno/turno.component.ts": 
        /*!***********************************************************************!*\
          !*** ./src/app/restaurante/components/turno/turno/turno.component.ts ***!
          \***********************************************************************/
        /*! exports provided: TurnoComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TurnoComponent", function () { return TurnoComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
            /* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/ __webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_3__);
            //import { LocalstorageService } from '../../../../admin/services/localstorage.service';
            var TurnoComponent = /** @class */ (function () {
                function TurnoComponent(
                //private ls: LocalstorageService
                ) {
                    var _this = this;
                    this.setTurno = function (trn) {
                        //console.log(trn); 
                        _this.turno = trn;
                        _this.frmTurno.loadDetalleTurno(+_this.turno.turno);
                    };
                    this.refreshTurnoList = function () { return _this.lstTurnoComponent.loadTurnos(); };
                    this.turno = {
                        turno: null, turno_tipo: null, inicio: moment__WEBPACK_IMPORTED_MODULE_3__().format(_shared_global__WEBPACK_IMPORTED_MODULE_2__["GLOBAL"].dbDateTimeFormat), fin: null
                    };
                }
                TurnoComponent.prototype.ngOnInit = function () {
                };
                return TurnoComponent;
            }());
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('lstTurno', { static: false })
            ], TurnoComponent.prototype, "lstTurnoComponent", void 0);
            tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('frmTurno', { static: false })
            ], TurnoComponent.prototype, "frmTurno", void 0);
            TurnoComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-turno',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./turno.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/turno/turno/turno.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./turno.component.css */ "./src/app/restaurante/components/turno/turno/turno.component.css")).default]
                })
            ], TurnoComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/unir-cuenta/unir-cuenta.component.css": 
        /*!******************************************************************************!*\
          !*** ./src/app/restaurante/components/unir-cuenta/unir-cuenta.component.css ***!
          \******************************************************************************/
        /*! exports provided: default */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony default export */ __webpack_exports__["default"] = ("\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3Jlc3RhdXJhbnRlL2NvbXBvbmVudHMvdW5pci1jdWVudGEvdW5pci1jdWVudGEuY29tcG9uZW50LmNzcyJ9 */");
            /***/ 
        }),
        /***/ "./src/app/restaurante/components/unir-cuenta/unir-cuenta.component.ts": 
        /*!*****************************************************************************!*\
          !*** ./src/app/restaurante/components/unir-cuenta/unir-cuenta.component.ts ***!
          \*****************************************************************************/
        /*! exports provided: UnirCuentaComponent */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UnirCuentaComponent", function () { return UnirCuentaComponent; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/esm2015/dialog.js");
            var UnirCuentaComponent = /** @class */ (function () {
                function UnirCuentaComponent(dialogRef, data) {
                    this.dialogRef = dialogRef;
                    this.data = data;
                    this.cuentaDe = null;
                    this.cuentaA = null;
                }
                UnirCuentaComponent.prototype.ngOnInit = function () {
                    // console.log(this.data.lstProductosSeleccionados);
                };
                UnirCuentaComponent.prototype.cancelar = function () {
                    this.dialogRef.close();
                };
                UnirCuentaComponent.prototype.unirCuentas = function (deCuenta, aCuenta) {
                    if (deCuenta === void 0) { deCuenta = 1; }
                    if (aCuenta === void 0) { aCuenta = 1; }
                    if (+deCuenta !== +aCuenta) {
                        this.data.lstProductosSeleccionados.map(function (p) {
                            if (+p.noCuenta === +deCuenta) {
                                p.noCuenta = aCuenta;
                            }
                        });
                    }
                    else {
                        this.data.lstProductosSeleccionados.map(function (p) { return p.noCuenta = +deCuenta; });
                    }
                    this.dialogRef.close(this.data.lstProductosSeleccionados);
                };
                UnirCuentaComponent.prototype.unirTodas = function () {
                    this.unirCuentas();
                };
                return UnirCuentaComponent;
            }());
            UnirCuentaComponent.ctorParameters = function () { return [
                { type: _angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MatDialogRef"] },
                { type: undefined, decorators: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"], args: [_angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"],] }] }
            ]; };
            UnirCuentaComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
                    selector: 'app-unir-cuenta',
                    template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./unir-cuenta.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/restaurante/components/unir-cuenta/unir-cuenta.component.html")).default,
                    styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./unir-cuenta.component.css */ "./src/app/restaurante/components/unir-cuenta/unir-cuenta.component.css")).default]
                }),
                tslib__WEBPACK_IMPORTED_MODULE_0__["__param"](1, Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"])(_angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"]))
            ], UnirCuentaComponent);
            /***/ 
        }),
        /***/ "./src/app/restaurante/restaurante-routing.module.ts": 
        /*!***********************************************************!*\
          !*** ./src/app/restaurante/restaurante-routing.module.ts ***!
          \***********************************************************/
        /*! exports provided: RestauranteRoutingModule */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RestauranteRoutingModule", function () { return RestauranteRoutingModule; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm2015/router.js");
            /* harmony import */ var _admin_services_authguard_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../admin/services/authguard.service */ "./src/app/admin/services/authguard.service.ts");
            /* harmony import */ var _components_area_area_area_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/area/area/area.component */ "./src/app/restaurante/components/area/area/area.component.ts");
            /* harmony import */ var _components_tran_areas_tran_areas_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/tran-areas/tran-areas.component */ "./src/app/restaurante/components/tran-areas/tran-areas.component.ts");
            /* harmony import */ var _components_turno_turno_turno_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/turno/turno/turno.component */ "./src/app/restaurante/components/turno/turno/turno.component.ts");
            /* harmony import */ var _components_reportes_rpt_ventas_rpt_ventas_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/reportes/rpt-ventas/rpt-ventas.component */ "./src/app/restaurante/components/reportes/rpt-ventas/rpt-ventas.component.ts");
            /* harmony import */ var _components_reportes_turnos_turnos_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/reportes/turnos/turnos.component */ "./src/app/restaurante/components/reportes/turnos/turnos.component.ts");
            /* harmony import */ var _components_reportes_propinas_propinas_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/reportes/propinas/propinas.component */ "./src/app/restaurante/components/reportes/propinas/propinas.component.ts");
            var routes = [
                { path: 'mantareas', component: _components_area_area_area_component__WEBPACK_IMPORTED_MODULE_4__["AreaComponent"], canActivate: [_admin_services_authguard_service__WEBPACK_IMPORTED_MODULE_3__["AuthguardService"]] },
                { path: 'tranareas', component: _components_tran_areas_tran_areas_component__WEBPACK_IMPORTED_MODULE_5__["TranAreasComponent"], canActivate: [_admin_services_authguard_service__WEBPACK_IMPORTED_MODULE_3__["AuthguardService"]] },
                { path: 'turno', component: _components_turno_turno_turno_component__WEBPACK_IMPORTED_MODULE_6__["TurnoComponent"], canActivate: [_admin_services_authguard_service__WEBPACK_IMPORTED_MODULE_3__["AuthguardService"]] },
                { path: 'rptvtascat', component: _components_reportes_rpt_ventas_rpt_ventas_component__WEBPACK_IMPORTED_MODULE_7__["RptVentasComponent"], canActivate: [_admin_services_authguard_service__WEBPACK_IMPORTED_MODULE_3__["AuthguardService"]] },
                { path: 'rptturnos', component: _components_reportes_turnos_turnos_component__WEBPACK_IMPORTED_MODULE_8__["TurnosComponent"], canActivate: [_admin_services_authguard_service__WEBPACK_IMPORTED_MODULE_3__["AuthguardService"]] },
                { path: 'rptpropinas', component: _components_reportes_propinas_propinas_component__WEBPACK_IMPORTED_MODULE_9__["PropinasComponent"], canActivate: [_admin_services_authguard_service__WEBPACK_IMPORTED_MODULE_3__["AuthguardService"]] },
                { path: '**', redirectTo: '/admin/dashboard', pathMatch: 'full' }
            ];
            var RestauranteRoutingModule = /** @class */ (function () {
                function RestauranteRoutingModule() {
                }
                return RestauranteRoutingModule;
            }());
            RestauranteRoutingModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
                    imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"].forChild(routes)],
                    exports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"]]
                })
            ], RestauranteRoutingModule);
            /***/ 
        }),
        /***/ "./src/app/restaurante/restaurante.module.ts": 
        /*!***************************************************!*\
          !*** ./src/app/restaurante/restaurante.module.ts ***!
          \***************************************************/
        /*! exports provided: RestauranteModule */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RestauranteModule", function () { return RestauranteModule; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm2015/common.js");
            /* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm2015/http.js");
            /* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm2015/forms.js");
            /* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../shared/shared.module */ "./src/app/shared/shared.module.ts");
            /* harmony import */ var _wms_wms_module__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../wms/wms.module */ "./src/app/wms/wms.module.ts");
            /* harmony import */ var _pos_pos_module__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../pos/pos.module */ "./src/app/pos/pos.module.ts");
            /* harmony import */ var _angular_material_list__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material/list */ "./node_modules/@angular/material/esm2015/list.js");
            /* harmony import */ var _angular_material_icon__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/icon */ "./node_modules/@angular/material/esm2015/icon.js");
            /* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/form-field */ "./node_modules/@angular/material/esm2015/form-field.js");
            /* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/material/input */ "./node_modules/@angular/material/esm2015/input.js");
            /* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/card */ "./node_modules/@angular/material/esm2015/card.js");
            /* harmony import */ var _angular_material_divider__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/material/divider */ "./node_modules/@angular/material/esm2015/divider.js");
            /* harmony import */ var _angular_material_tabs__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/material/tabs */ "./node_modules/@angular/material/esm2015/tabs.js");
            /* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @angular/material/table */ "./node_modules/@angular/material/esm2015/table.js");
            /* harmony import */ var _angular_material_select__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @angular/material/select */ "./node_modules/@angular/material/esm2015/select.js");
            /* harmony import */ var _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/material/checkbox */ "./node_modules/@angular/material/esm2015/checkbox.js");
            /* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm2015/button.js");
            /* harmony import */ var _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @angular/material/snack-bar */ "./node_modules/@angular/material/esm2015/snack-bar.js");
            /* harmony import */ var _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @angular/material/toolbar */ "./node_modules/@angular/material/esm2015/toolbar.js");
            /* harmony import */ var _angular_material_menu__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @angular/material/menu */ "./node_modules/@angular/material/esm2015/menu.js");
            /* harmony import */ var _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @angular/material/grid-list */ "./node_modules/@angular/material/esm2015/grid-list.js");
            /* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @angular/material/paginator */ "./node_modules/@angular/material/esm2015/paginator.js");
            /* harmony import */ var _angular_material_dialog__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @angular/material/dialog */ "./node_modules/@angular/material/esm2015/dialog.js");
            /* harmony import */ var _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @angular/material/sidenav */ "./node_modules/@angular/material/esm2015/sidenav.js");
            /* harmony import */ var _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @angular/material/datepicker */ "./node_modules/@angular/material/esm2015/datepicker.js");
            /* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm2015/material.js");
            /* harmony import */ var _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! @angular/cdk/drag-drop */ "./node_modules/@angular/cdk/esm2015/drag-drop.js");
            /* harmony import */ var _ngx_material_keyboard_core__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! @ngx-material-keyboard/core */ "./node_modules/@ngx-material-keyboard/core/esm2015/ngx-material-keyboard-core.js");
            /* harmony import */ var _ecodev_fab_speed_dial__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! @ecodev/fab-speed-dial */ "./node_modules/@ecodev/fab-speed-dial/fesm2015/ecodev-fab-speed-dial.js");
            /* harmony import */ var _protacon_ng_virtual_keyboard__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! @protacon/ng-virtual-keyboard */ "./node_modules/@protacon/ng-virtual-keyboard/dist/index.js");
            /* harmony import */ var _protacon_ng_virtual_keyboard__WEBPACK_IMPORTED_MODULE_31___default = /*#__PURE__*/ __webpack_require__.n(_protacon_ng_virtual_keyboard__WEBPACK_IMPORTED_MODULE_31__);
            /* harmony import */ var _restaurante_routing_module__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./restaurante-routing.module */ "./src/app/restaurante/restaurante-routing.module.ts");
            /* harmony import */ var _components_tran_areas_tran_areas_component__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./components/tran-areas/tran-areas.component */ "./src/app/restaurante/components/tran-areas/tran-areas.component.ts");
            /* harmony import */ var _components_mesa_mesa_component__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./components/mesa/mesa.component */ "./src/app/restaurante/components/mesa/mesa.component.ts");
            /* harmony import */ var _components_abrir_mesa_abrir_mesa_component__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./components/abrir-mesa/abrir-mesa.component */ "./src/app/restaurante/components/abrir-mesa/abrir-mesa.component.ts");
            /* harmony import */ var _components_tran_comanda_tran_comanda_component__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./components/tran-comanda/tran-comanda.component */ "./src/app/restaurante/components/tran-comanda/tran-comanda.component.ts");
            /* harmony import */ var _components_lista_productos_comanda_lista_productos_comanda_component__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./components/lista-productos-comanda/lista-productos-comanda.component */ "./src/app/restaurante/components/lista-productos-comanda/lista-productos-comanda.component.ts");
            /* harmony import */ var _components_unir_cuenta_unir_cuenta_component__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./components/unir-cuenta/unir-cuenta.component */ "./src/app/restaurante/components/unir-cuenta/unir-cuenta.component.ts");
            /* harmony import */ var _components_area_lista_area_lista_area_component__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ./components/area/lista-area/lista-area.component */ "./src/app/restaurante/components/area/lista-area/lista-area.component.ts");
            /* harmony import */ var _components_area_form_area_form_area_component__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ./components/area/form-area/form-area.component */ "./src/app/restaurante/components/area/form-area/form-area.component.ts");
            /* harmony import */ var _components_area_area_area_component__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ./components/area/area/area.component */ "./src/app/restaurante/components/area/area/area.component.ts");
            /* harmony import */ var _components_pide_datos_cuentas_pide_datos_cuentas_component__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./components/pide-datos-cuentas/pide-datos-cuentas.component */ "./src/app/restaurante/components/pide-datos-cuentas/pide-datos-cuentas.component.ts");
            /* harmony import */ var _components_turno_turno_turno_component__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! ./components/turno/turno/turno.component */ "./src/app/restaurante/components/turno/turno/turno.component.ts");
            /* harmony import */ var _components_turno_lista_turno_lista_turno_component__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! ./components/turno/lista-turno/lista-turno.component */ "./src/app/restaurante/components/turno/lista-turno/lista-turno.component.ts");
            /* harmony import */ var _components_turno_form_turno_form_turno_component__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! ./components/turno/form-turno/form-turno.component */ "./src/app/restaurante/components/turno/form-turno/form-turno.component.ts");
            /* harmony import */ var _components_area_area_designer_area_designer_component__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! ./components/area/area-designer/area-designer.component */ "./src/app/restaurante/components/area/area-designer/area-designer.component.ts");
            /* harmony import */ var _components_reportes_rpt_ventas_rpt_ventas_component__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! ./components/reportes/rpt-ventas/rpt-ventas.component */ "./src/app/restaurante/components/reportes/rpt-ventas/rpt-ventas.component.ts");
            /* harmony import */ var _components_reportes_rpt_ventas_por_categoria_por_categoria_component__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! ./components/reportes/rpt-ventas/por-categoria/por-categoria.component */ "./src/app/restaurante/components/reportes/rpt-ventas/por-categoria/por-categoria.component.ts");
            /* harmony import */ var _components_reportes_rpt_ventas_por_articulo_por_articulo_component__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! ./components/reportes/rpt-ventas/por-articulo/por-articulo.component */ "./src/app/restaurante/components/reportes/rpt-ventas/por-articulo/por-articulo.component.ts");
            /* harmony import */ var _components_reportes_turnos_turnos_component__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! ./components/reportes/turnos/turnos.component */ "./src/app/restaurante/components/reportes/turnos/turnos.component.ts");
            /* harmony import */ var _components_reportes_propinas_propinas_component__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! ./components/reportes/propinas/propinas.component */ "./src/app/restaurante/components/reportes/propinas/propinas.component.ts");
            // import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
            // const config: SocketIoConfig = { url: 'http://localhost:8988', options: {} };
            var RestauranteModule = /** @class */ (function () {
                function RestauranteModule() {
                }
                return RestauranteModule;
            }());
            RestauranteModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
                    declarations: [
                        _components_tran_areas_tran_areas_component__WEBPACK_IMPORTED_MODULE_33__["TranAreasComponent"], _components_mesa_mesa_component__WEBPACK_IMPORTED_MODULE_34__["MesaComponent"], _components_abrir_mesa_abrir_mesa_component__WEBPACK_IMPORTED_MODULE_35__["AbrirMesaComponent"], _components_tran_comanda_tran_comanda_component__WEBPACK_IMPORTED_MODULE_36__["TranComandaComponent"], _components_lista_productos_comanda_lista_productos_comanda_component__WEBPACK_IMPORTED_MODULE_37__["ListaProductosComandaComponent"], _components_unir_cuenta_unir_cuenta_component__WEBPACK_IMPORTED_MODULE_38__["UnirCuentaComponent"],
                        _components_area_lista_area_lista_area_component__WEBPACK_IMPORTED_MODULE_39__["ListaAreaComponent"], _components_area_form_area_form_area_component__WEBPACK_IMPORTED_MODULE_40__["FormAreaComponent"], _components_area_area_area_component__WEBPACK_IMPORTED_MODULE_41__["AreaComponent"], _components_pide_datos_cuentas_pide_datos_cuentas_component__WEBPACK_IMPORTED_MODULE_42__["PideDatosCuentasComponent"], _components_turno_turno_turno_component__WEBPACK_IMPORTED_MODULE_43__["TurnoComponent"], _components_turno_lista_turno_lista_turno_component__WEBPACK_IMPORTED_MODULE_44__["ListaTurnoComponent"],
                        _components_turno_form_turno_form_turno_component__WEBPACK_IMPORTED_MODULE_45__["FormTurnoComponent"], _components_area_area_designer_area_designer_component__WEBPACK_IMPORTED_MODULE_46__["AreaDesignerComponent"], _components_reportes_rpt_ventas_rpt_ventas_component__WEBPACK_IMPORTED_MODULE_47__["RptVentasComponent"], _components_reportes_rpt_ventas_por_categoria_por_categoria_component__WEBPACK_IMPORTED_MODULE_48__["PorCategoriaComponent"], _components_reportes_rpt_ventas_por_articulo_por_articulo_component__WEBPACK_IMPORTED_MODULE_49__["PorArticuloComponent"], _components_reportes_turnos_turnos_component__WEBPACK_IMPORTED_MODULE_50__["TurnosComponent"], _components_reportes_propinas_propinas_component__WEBPACK_IMPORTED_MODULE_51__["PropinasComponent"]
                    ],
                    entryComponents: [
                        _components_abrir_mesa_abrir_mesa_component__WEBPACK_IMPORTED_MODULE_35__["AbrirMesaComponent"], _components_unir_cuenta_unir_cuenta_component__WEBPACK_IMPORTED_MODULE_38__["UnirCuentaComponent"], _components_pide_datos_cuentas_pide_datos_cuentas_component__WEBPACK_IMPORTED_MODULE_42__["PideDatosCuentasComponent"], _components_area_area_designer_area_designer_component__WEBPACK_IMPORTED_MODULE_46__["AreaDesignerComponent"]
                    ],
                    imports: [
                        _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"],
                        _restaurante_routing_module__WEBPACK_IMPORTED_MODULE_32__["RestauranteRoutingModule"],
                        _angular_common_http__WEBPACK_IMPORTED_MODULE_3__["HttpClientModule"],
                        _angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormsModule"],
                        _shared_shared_module__WEBPACK_IMPORTED_MODULE_5__["SharedModule"],
                        _wms_wms_module__WEBPACK_IMPORTED_MODULE_6__["WmsModule"],
                        _pos_pos_module__WEBPACK_IMPORTED_MODULE_7__["PosModule"],
                        // SocketIoModule.forRoot(config),
                        _angular_material_list__WEBPACK_IMPORTED_MODULE_8__["MatListModule"],
                        _angular_material_icon__WEBPACK_IMPORTED_MODULE_9__["MatIconModule"],
                        _angular_material_form_field__WEBPACK_IMPORTED_MODULE_10__["MatFormFieldModule"],
                        _angular_material_input__WEBPACK_IMPORTED_MODULE_11__["MatInputModule"],
                        _angular_material_card__WEBPACK_IMPORTED_MODULE_12__["MatCardModule"],
                        _angular_material_divider__WEBPACK_IMPORTED_MODULE_13__["MatDividerModule"],
                        _angular_material_tabs__WEBPACK_IMPORTED_MODULE_14__["MatTabsModule"],
                        _angular_material_table__WEBPACK_IMPORTED_MODULE_15__["MatTableModule"],
                        _angular_material_select__WEBPACK_IMPORTED_MODULE_16__["MatSelectModule"],
                        _angular_material_checkbox__WEBPACK_IMPORTED_MODULE_17__["MatCheckboxModule"],
                        _angular_material_button__WEBPACK_IMPORTED_MODULE_18__["MatButtonModule"],
                        _angular_material_snack_bar__WEBPACK_IMPORTED_MODULE_19__["MatSnackBarModule"],
                        _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_20__["MatToolbarModule"],
                        _angular_material_menu__WEBPACK_IMPORTED_MODULE_21__["MatMenuModule"],
                        _angular_material_grid_list__WEBPACK_IMPORTED_MODULE_22__["MatGridListModule"],
                        _angular_material_paginator__WEBPACK_IMPORTED_MODULE_23__["MatPaginatorModule"],
                        _angular_material_dialog__WEBPACK_IMPORTED_MODULE_24__["MatDialogModule"],
                        _ngx_material_keyboard_core__WEBPACK_IMPORTED_MODULE_29__["MatKeyboardModule"],
                        _angular_material_sidenav__WEBPACK_IMPORTED_MODULE_25__["MatSidenavModule"],
                        _angular_material_datepicker__WEBPACK_IMPORTED_MODULE_26__["MatDatepickerModule"],
                        _angular_material__WEBPACK_IMPORTED_MODULE_27__["MatNativeDateModule"],
                        _ecodev_fab_speed_dial__WEBPACK_IMPORTED_MODULE_30__["EcoFabSpeedDialModule"],
                        _angular_cdk_drag_drop__WEBPACK_IMPORTED_MODULE_28__["DragDropModule"],
                        _protacon_ng_virtual_keyboard__WEBPACK_IMPORTED_MODULE_31__["NgVirtualKeyboardModule"]
                    ],
                    providers: [
                        _angular_material__WEBPACK_IMPORTED_MODULE_27__["MatNativeDateModule"]
                    ]
                })
            ], RestauranteModule);
            /***/ 
        }),
        /***/ "./src/app/restaurante/services/area.service.ts": 
        /*!******************************************************!*\
          !*** ./src/app/restaurante/services/area.service.ts ***!
          \******************************************************/
        /*! exports provided: AreaService */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AreaService", function () { return AreaService; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm2015/http.js");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var _shared_error_handler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../shared/error-handler */ "./src/app/shared/error-handler.ts");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm2015/operators/index.js");
            /* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! qs */ "./node_modules/qs/lib/index.js");
            /* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/ __webpack_require__.n(qs__WEBPACK_IMPORTED_MODULE_7__);
            var AreaService = /** @class */ (function () {
                function AreaService(http, ls) {
                    this.http = http;
                    this.ls = ls;
                    this.moduleUrl = 'mante/area';
                    this.usrToken = null;
                    this.srvcErrHndl = new _shared_error_handler__WEBPACK_IMPORTED_MODULE_4__["ServiceErrorHandler"]();
                    this.usrToken = this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar) ? this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar).token : null;
                }
                AreaService.prototype.get = function (fltr) {
                    if (fltr === void 0) { fltr = {}; }
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].url + "/" + this.moduleUrl + "/get_areas?" + qs__WEBPACK_IMPORTED_MODULE_7__["stringify"](fltr), httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                AreaService.prototype.save = function (entidad) {
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.post(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].url + "/" + this.moduleUrl + "/guardar", entidad, httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                return AreaService;
            }());
            AreaService.ctorParameters = function () { return [
                { type: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__["LocalstorageService"] }
            ]; };
            AreaService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
                    providedIn: 'root'
                })
            ], AreaService);
            /***/ 
        }),
        /***/ "./src/app/restaurante/services/comanda.service.ts": 
        /*!*********************************************************!*\
          !*** ./src/app/restaurante/services/comanda.service.ts ***!
          \*********************************************************/
        /*! exports provided: ComandaService */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ComandaService", function () { return ComandaService; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm2015/http.js");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var _shared_error_handler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../shared/error-handler */ "./src/app/shared/error-handler.ts");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm2015/operators/index.js");
            /* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! qs */ "./node_modules/qs/lib/index.js");
            /* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/ __webpack_require__.n(qs__WEBPACK_IMPORTED_MODULE_7__);
            var ComandaService = /** @class */ (function () {
                function ComandaService(http, ls) {
                    this.http = http;
                    this.ls = ls;
                    this.moduleUrl = 'comanda';
                    this.usrToken = null;
                    this.srvcErrHndl = new _shared_error_handler__WEBPACK_IMPORTED_MODULE_4__["ServiceErrorHandler"]();
                    this.usrToken = this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar) ? this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar).token : null;
                }
                ComandaService.prototype.get = function (fltr) {
                    if (fltr === void 0) { fltr = {}; }
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlAppRestaurante + "/" + this.moduleUrl + "/buscar?" + qs__WEBPACK_IMPORTED_MODULE_7__["stringify"](fltr), httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                ComandaService.prototype.getComandaDeMesa = function (idmesa) {
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlAppRestaurante + "/" + this.moduleUrl + "/get_comanda/" + idmesa, httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                ComandaService.prototype.save = function (entidad) {
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.post(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlAppRestaurante + "/" + this.moduleUrl + "/guardar" + (entidad.comanda ? ('/' + entidad.comanda) : ''), entidad, httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                ComandaService.prototype.saveDetalle = function (idcomanda, idcuenta, detalle) {
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    // const urlComplement = detalle.detalle_comanda && detalle.detalle_cuenta  ? `/${detalle.detalle_cuenta}` : '';
                    return this.http
                        .post(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlAppRestaurante + "/" + this.moduleUrl + "/guardar_detalle/" + idcomanda + "/" + idcuenta, detalle, httpOptions)
                        .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                ComandaService.prototype.setProductoImpreso = function (idcuenta) {
                    if (idcuenta === void 0) { idcuenta = 0; }
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlAppRestaurante + "/" + this.moduleUrl + "/imprimir/" + idcuenta, httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                return ComandaService;
            }());
            ComandaService.ctorParameters = function () { return [
                { type: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__["LocalstorageService"] }
            ]; };
            ComandaService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
                    providedIn: 'root'
                })
            ], ComandaService);
            /***/ 
        }),
        /***/ "./src/app/restaurante/services/mesa.service.ts": 
        /*!******************************************************!*\
          !*** ./src/app/restaurante/services/mesa.service.ts ***!
          \******************************************************/
        /*! exports provided: MesaService */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MesaService", function () { return MesaService; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm2015/http.js");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var _shared_error_handler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../shared/error-handler */ "./src/app/shared/error-handler.ts");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm2015/operators/index.js");
            /* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! qs */ "./node_modules/qs/lib/index.js");
            /* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/ __webpack_require__.n(qs__WEBPACK_IMPORTED_MODULE_7__);
            var MesaService = /** @class */ (function () {
                function MesaService(http, ls) {
                    this.http = http;
                    this.ls = ls;
                    this.moduleUrl = 'mesa';
                    this.usrToken = null;
                    this.srvcErrHndl = new _shared_error_handler__WEBPACK_IMPORTED_MODULE_4__["ServiceErrorHandler"]();
                    this.usrToken = this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar) ? this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar).token : null;
                }
                MesaService.prototype.get = function (fltr) {
                    if (fltr === void 0) { fltr = {}; }
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlMantenimientos + "/" + this.moduleUrl + "/buscar?" + qs__WEBPACK_IMPORTED_MODULE_7__["stringify"](fltr), httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                MesaService.prototype.save = function (entidad) {
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.post(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlMantenimientos + "/mesa/guardar" + (entidad.mesa ? ('/' + entidad.mesa) : ''), entidad, httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                return MesaService;
            }());
            MesaService.ctorParameters = function () { return [
                { type: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__["LocalstorageService"] }
            ]; };
            MesaService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
                    providedIn: 'root'
                })
            ], MesaService);
            /***/ 
        }),
        /***/ "./src/app/restaurante/services/reporte-ventas.service.ts": 
        /*!****************************************************************!*\
          !*** ./src/app/restaurante/services/reporte-ventas.service.ts ***!
          \****************************************************************/
        /*! exports provided: ReporteVentasService */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReporteVentasService", function () { return ReporteVentasService; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm2015/http.js");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var _shared_error_handler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../shared/error-handler */ "./src/app/shared/error-handler.ts");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm2015/operators/index.js");
            var ReporteVentasService = /** @class */ (function () {
                function ReporteVentasService(http, ls) {
                    this.http = http;
                    this.ls = ls;
                    this.moduleUrl = 'reporte/venta';
                    this.usrToken = null;
                    this.srvcErrHndl = new _shared_error_handler__WEBPACK_IMPORTED_MODULE_4__["ServiceErrorHandler"]();
                    this.usrToken = this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar) ? this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar).token : null;
                }
                ReporteVentasService.prototype.porCategoria = function (params) {
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.post(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlFacturacion + "/" + this.moduleUrl + "/categoria", params, httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                ReporteVentasService.prototype.porArticulo = function (params) {
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.post(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlFacturacion + "/" + this.moduleUrl + "/articulo", params, httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                return ReporteVentasService;
            }());
            ReporteVentasService.ctorParameters = function () { return [
                { type: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__["LocalstorageService"] }
            ]; };
            ReporteVentasService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
                    providedIn: 'root'
                })
            ], ReporteVentasService);
            /***/ 
        }),
        /***/ "./src/app/restaurante/services/tipo-turno.service.ts": 
        /*!************************************************************!*\
          !*** ./src/app/restaurante/services/tipo-turno.service.ts ***!
          \************************************************************/
        /*! exports provided: TipoTurnoService */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TipoTurnoService", function () { return TipoTurnoService; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm2015/http.js");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var _shared_error_handler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../shared/error-handler */ "./src/app/shared/error-handler.ts");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm2015/operators/index.js");
            /* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! qs */ "./node_modules/qs/lib/index.js");
            /* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/ __webpack_require__.n(qs__WEBPACK_IMPORTED_MODULE_7__);
            var TipoTurnoService = /** @class */ (function () {
                function TipoTurnoService(http, ls) {
                    this.http = http;
                    this.ls = ls;
                    this.moduleUrl = 'turno';
                    this.usrToken = null;
                    this.srvcErrHndl = new _shared_error_handler__WEBPACK_IMPORTED_MODULE_4__["ServiceErrorHandler"]();
                    this.usrToken = this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar) ? this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar).token : null;
                }
                TipoTurnoService.prototype.get = function (fltr) {
                    if (fltr === void 0) { fltr = {}; }
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlMantenimientos + "/" + this.moduleUrl + "/get_turno_tipo?" + qs__WEBPACK_IMPORTED_MODULE_7__["stringify"](fltr), httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                TipoTurnoService.prototype.save = function (entidad) {
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.post(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlAppRestaurante + "/" + this.moduleUrl + "/guardar_turno_tipo" + (entidad.turno_tipo ? ('/' + entidad.turno_tipo) : ''), entidad, httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                return TipoTurnoService;
            }());
            TipoTurnoService.ctorParameters = function () { return [
                { type: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__["LocalstorageService"] }
            ]; };
            TipoTurnoService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
                    providedIn: 'root'
                })
            ], TipoTurnoService);
            /***/ 
        }),
        /***/ "./src/app/restaurante/services/turno.service.ts": 
        /*!*******************************************************!*\
          !*** ./src/app/restaurante/services/turno.service.ts ***!
          \*******************************************************/
        /*! exports provided: TurnoService */
        /***/ (function (module, __webpack_exports__, __webpack_require__) {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TurnoService", function () { return TurnoService; });
            /* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
            /* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
            /* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm2015/http.js");
            /* harmony import */ var _shared_global__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../shared/global */ "./src/app/shared/global.ts");
            /* harmony import */ var _shared_error_handler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../shared/error-handler */ "./src/app/shared/error-handler.ts");
            /* harmony import */ var _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../admin/services/localstorage.service */ "./src/app/admin/services/localstorage.service.ts");
            /* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm2015/operators/index.js");
            /* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! qs */ "./node_modules/qs/lib/index.js");
            /* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/ __webpack_require__.n(qs__WEBPACK_IMPORTED_MODULE_7__);
            var TurnoService = /** @class */ (function () {
                function TurnoService(http, ls) {
                    this.http = http;
                    this.ls = ls;
                    this.moduleUrl = 'turno';
                    this.usrToken = null;
                    this.srvcErrHndl = new _shared_error_handler__WEBPACK_IMPORTED_MODULE_4__["ServiceErrorHandler"]();
                    this.usrToken = this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar) ? this.ls.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].usrTokenVar).token : null;
                }
                TurnoService.prototype.get = function (fltr) {
                    if (fltr === void 0) { fltr = {}; }
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlMantenimientos + "/" + this.moduleUrl + "/buscar?" + qs__WEBPACK_IMPORTED_MODULE_7__["stringify"](fltr), httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                TurnoService.prototype.save = function (entidad) {
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.post(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlMantenimientos + "/" + this.moduleUrl + "/guardar" + (entidad.turno ? ('/' + entidad.turno) : ''), entidad, httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                TurnoService.prototype.getDetalle = function (idturno, fltr) {
                    if (fltr === void 0) { fltr = {}; }
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.get(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlMantenimientos + "/" + this.moduleUrl + "/buscar_usuario/" + idturno + "?" + qs__WEBPACK_IMPORTED_MODULE_7__["stringify"](fltr), httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                TurnoService.prototype.saveDetalle = function (entidad) {
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.post(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlMantenimientos + "/" + this.moduleUrl + "/agregar_usuario/" + entidad.turno, entidad, httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                TurnoService.prototype.anularDetalle = function (entidad) {
                    var httpOptions = {
                        headers: new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpHeaders"]({
                            'Authorization': this.usrToken
                        })
                    };
                    return this.http.post(_shared_global__WEBPACK_IMPORTED_MODULE_3__["GLOBAL"].urlMantenimientos + "/" + this.moduleUrl + "/anular_usuario/" + entidad.turno, entidad, httpOptions).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["retry"])(1), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["catchError"])(this.srvcErrHndl.errorHandler));
                };
                return TurnoService;
            }());
            TurnoService.ctorParameters = function () { return [
                { type: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"] },
                { type: _admin_services_localstorage_service__WEBPACK_IMPORTED_MODULE_5__["LocalstorageService"] }
            ]; };
            TurnoService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
                Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
                    providedIn: 'root'
                })
            ], TurnoService);
            /***/ 
        })
    }]);
//# sourceMappingURL=restaurante-restaurante-module-es2015.js.map
//# sourceMappingURL=restaurante-restaurante-module-es5.js.map
//# sourceMappingURL=restaurante-restaurante-module-es5.js.map