import React from 'react';
import { shallow } from 'enzyme';
import Stepper from 'material-ui/Stepper/Stepper';
import Step from 'material-ui/Stepper/Step';
import StepContent from 'material-ui/Stepper/StepContent';
import StepButton from 'material-ui/Stepper/StepButton';
import IconButton from 'material-ui/IconButton';
import ForwardIcon from 'material-ui/svg-icons/navigation/arrow-forward';
import BackwardIcon from 'material-ui/svg-icons/navigation/arrow-back';
import log from 'loglevel';
import {
    createStepperFromConfig,
    createStepperContentFromConfig,
    StepperNavigationBack,
    StepperNavigationForward,
} from '../stepper';

describe('Stepper utility functions', () => {
    const renderStepper = (stepperConfig, props = {}) => {
        const GeneratedStepper = createStepperFromConfig(stepperConfig);

        return shallow(<GeneratedStepper {...props} />);
    };

    let stepperConfig;

    beforeEach(() => {
        stepperConfig = [
            { key: 'first', name: 'First step!' },
            { key: 'last', name: 'My last step!' },
        ];
    });

    describe('createStepperFromConfig', () => {
        test('should render a Stepper component', () => {
            const renderedStepper = renderStepper(stepperConfig);
            expect(renderedStepper.type()).toEqual(Stepper);
        });

        test('should render 2 steps', () => {
            const renderedStepper = renderStepper(stepperConfig);
            expect(renderedStepper.children()).toHaveLength(2);
            expect(renderedStepper.children(Step)).toHaveLength(2);
        });

        test('should render in default horizontal position', () => {
            const renderedStepper = renderStepper(stepperConfig);

            expect(renderedStepper.prop('orientation')).toBe('horizontal');
        });

        test('should render in vertical position', () => {
            const VerticalStepper = createStepperFromConfig(stepperConfig, 'vertical');
            const renderedStepper = shallow(<VerticalStepper />);

            expect(renderedStepper.prop('orientation')).toBe('vertical');
        });

        test('should render both steps as not active', () => {
            const renderedStepper = renderStepper(stepperConfig);

            expect(renderedStepper.find(Step).at(0).prop('active')).toBe(false);
            expect(renderedStepper.find(Step).at(1).prop('active')).toBe(false);
        });

        test('should render the 2nd step as active', () => {
            const renderedStepper = renderStepper(stepperConfig, {
                activeStep: 'last',
            });

            expect(renderedStepper.children().at(0).prop('active')).toBe(false);
            expect(renderedStepper.children().at(1).prop('active')).toBe(true);
        });

        test('should render the 2nd step as active by index', () => {
            const renderedStepper = renderStepper(stepperConfig, {
                activeStep: 1,
            });

            expect(renderedStepper.childAt(0).prop('active')).toBe(false);
            expect(renderedStepper.childAt(1).prop('active')).toBe(true);
        });

        test('should render a StepContent component when a step has content', () => {
            stepperConfig[0].content = () => <div>Content!</div>;
            const renderedStepper = renderStepper(stepperConfig);

            expect(renderedStepper.find(Step).at(0).children(StepContent)).toHaveLength(1);
        });

        test('should render call the stepperClicked callback', () => {
            const stepperClicked = jest.fn();
            const renderedStepper = renderStepper(stepperConfig, { stepperClicked });

            renderedStepper.find(StepButton).at(0).simulate('click');

            expect(stepperClicked).toHaveBeenCalledWith('first');
        });
    });

    describe('createStepperContentFromConfig', () => {
        beforeEach(() => {
            jest.spyOn(log, 'warn');
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        test('should log a warning when no active step has been passed', () => {
            const ContentStepper = createStepperContentFromConfig(stepperConfig);
            shallow(<ContentStepper />);

            expect(log.warn).toBeCalledWith('The `activeStep` prop is undefined, therefore the component created by `createStepperContentFromConfig` will render null');
        });

        test('should log a warning when the step does not have a component', () => {
            const ContentStepper = createStepperContentFromConfig(stepperConfig);
            shallow(<ContentStepper activeStep="first" />);

            expect(log.warn).toBeCalledWith('Could not find a content component for a step with key (first) in', stepperConfig);
        });

        test('should render null when no component has been provided', () => {
            const ContentStepper = createStepperContentFromConfig(stepperConfig);
            const renderedStepper = shallow(<ContentStepper activeStep="first" />);

            expect(renderedStepper.html()).toBeNull();
        });

        test(
            'should render the component that is provided with the step when that step is active',
            () => {
                const MyContent = () => (<div>My content</div>);
                stepperConfig[0].component = MyContent;

                const ContentStepper = createStepperContentFromConfig(stepperConfig);
                const renderedStepper = shallow(<ContentStepper activeStep="first" />);

                expect(renderedStepper.type()).toEqual(MyContent);
            }
        );

        test(
            'should pass the props (besides `activeStep`) through to the step component',
            () => {
                const MyContent = () => (<div>My content</div>);
                stepperConfig[0].component = MyContent;

                const ContentStepper = createStepperContentFromConfig(stepperConfig);
                const renderedStepper = shallow(<ContentStepper activeStep="first" name="John" coolStyle />);

                expect(renderedStepper.props()).toEqual({ name: 'John', coolStyle: true });
            }
        );
    });

    describe('StepperNavigationBack', () => {
        let backButton;
        let onBackClickSpy;

        beforeEach(() => {
            onBackClickSpy = jest.fn();
            backButton = shallow(<StepperNavigationBack onBackClick={onBackClickSpy} />);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        test('should render a IconButton', () => {
            expect(backButton.type()).toEqual(IconButton);
        });

        test('should render a BackwardIcon', () => {
            expect(backButton.children(BackwardIcon)).toHaveLength(1);
        });

        test('should call the onBackClick callback when the button is clicked', () => {
            backButton.simulate('click');

            expect(onBackClickSpy).toHaveBeenCalled();
        });
    });

    describe('StepperNavigationForward', () => {
        let forwardButton;
        let onForwardClickSpy;

        beforeEach(() => {
            onForwardClickSpy = jest.fn();
            forwardButton = shallow(<StepperNavigationForward onForwardClick={onForwardClickSpy} />);
        });

        test('should render a IconButton', () => {
            expect(forwardButton.type()).toEqual(IconButton);
        });

        test('should render a ForwardIcon', () => {
            expect(forwardButton.children(ForwardIcon)).toHaveLength(1);
        });

        test('should call the onForwardClick callback when the button is clicked', () => {
            forwardButton.simulate('click');

            expect(onForwardClickSpy).toHaveBeenCalled();
        });
    });
});
