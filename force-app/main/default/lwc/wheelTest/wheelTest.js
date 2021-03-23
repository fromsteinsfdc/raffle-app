import { LightningElement, track } from 'lwc';
const OPEN_PAREN = '(';
const CLOSE_PAREN = ')';
const ROTATE_X = 'rotateX';
const ROTATE_Y = 'rotateY';
const ROTATE_Z = 'rotateZ';

const NAMES_CSV = 'Maximilian Thompson,Alina Reed,Sienna Carroll,Sawyer Farrell,Bruce Barrett,Florrie Gibson,James Mason,Catherine Evans,Lucy Dixon,Dale Casey,Cherry Payne,Kevin Brown,Camila Higgins,Melanie Allen,Myra Phillips,Luke Mason,Sofia Stevens,Garry Jones,Adison Payne,Naomi Perry,Walter Parker,Steven Harper,Sophia Howard,Owen Craig,Patrick Tucker,Vincent Armstrong,Savana Watson,Maddie Phillips,Elian Carroll,Kelsey Jones,Alford Mitchell,Cherry Scott,Kristian Russell,April Parker,Deanna Higgins,Frederick Allen,April Richardson,Paige Murphy,Elise Myers,Olivia Cole,James Murray,Nicole Walker,Walter Roberts,Rosie Farrell,Samantha Ross,Fiona West,Cherry Riley,Alen Ryan,Isabella Warren,Carl Sullivan,Joyce Allen,Dexter Evans,Valeria Turner,Carl Carroll,Vanessa Hamilton,Heather Wilson,Samantha Payne,Kristian Mason,Marcus Taylor,Tony Walker,Julian Allen,Kevin Kelly,Derek Evans,Edward Myers,Charlie Wells,Adrian Johnson,Richard Davis,Dexter Martin,Derek Hunt,Camila Wells,Ada Parker,Charlie Scott,Kirsten Farrell,Sophia Cameron,Clark Parker,Natalie Wright,Vivian Baker,Tara Baker,Adrianna Anderson,Mary Morgan,Amber Foster,Penelope Owens,Tiana Brooks,Elise Tucker,Rubie Sullivan,Amber Morrison,Adam Stewart,Blake Parker,Eleanor Campbell,Cherry Myers,Ted Morgan,Ellia Riley,Valeria Johnson,Anna Hill,Emily Cole,Florrie Brown,Chloe Campbell,Patrick Murphy,George Montgomery,Kimberly Myers,Frederick Higgins,Dominik Williams,Daisy Jones,Dale Ellis,John Payne,Paul Johnson,Heather Barnes,Mike Baker,Dominik Craig,Robert Phillips,Naomi Scott,Brooke Smith,Maximilian Adams,Chelsea Brown,Tony Adams,Lyndon Harris,Alford Farrell,Dale Crawford,Daryl Davis,Rafael Phillips,Adam Owens,Lyndon Walker,Rubie Barrett,Blake Cole,Edwin Jones,Jack Thompson,Chester Hall,Penelope Chapman,Derek Murphy,Agata Scott,Roland Adams,Adison Murray,Frederick Farrell,Ellia Stewart,Chester Richardson,Aston Armstrong,Richard Wright,George Rogers,Lana Ferguson,Daisy Russell,Daryl Scott,Belinda Sullivan,Marcus Davis,Jenna Carroll,Miller Phillips,Jordan Hamilton,Amelia Harper,Adelaide Richards,Amanda Scott,Michelle Owens,Ted Thompson,Jenna Warren,Alexander Ferguson,Grace Ryan,Aldus Wells,Tyler Taylor,Cadie Brown,Sienna Casey,Adison Wilson,Maria Phillips,Oliver Spencer,Samantha Myers,Agata Wells,Ted Clark,Rebecca Morgan,Dale Parker,Tara Reed,Adison Walker,Jacob Barrett,Melanie Wilson,Lana Walker,Adelaide Lloyd,Chester Elliott,Preston Payne,Evelyn Andrews,Abigail Stevens,Wilson Casey,Patrick Mason,Ned Mitchell,Victor Walker,Sam Richards,Frederick Ross,Joyce Tucker,Emily Holmes,Ryan Brown,Darcy Williams,Victoria Robinson,Arnold Hamilton,Edwin Wright,Ned Armstrong,Preston Richardson,Melanie Hawkins,Miley Morgan,Roland Stewart,Dexter Chapman,Cadie Wright,Adele Miller,Thomas Mitchell,Mary Morris,Lenny Phillips';

export default class WheelTest extends LightningElement {

    rendered;
    deg = 0;
    speed = 10;
    radius;

    numFaces = 20;
    @track faces = [];


    connectedCallback() {
        for (let i=0; i<this.numFaces; i++) {
            this.faces.push({
                label: (i+1),
                index: i
            })
        }
    }

    renderedCallback() {
        if (this.rendered) return;
        this.rendered = true;
        this.createWheel(this.numFaces);
    }

    get face() {
        return this.template.querySelector('.face');
    }

    get wheel() {
        return this.template.querySelector('.wheel');
    }

    get names() {
        return NAMES_CSV.split(',');
    }

    createWheel(numFaces) {
        let theta = 360 / numFaces;
        
        this.radius = this.template.querySelector('.face').offsetHeight / (2 * Math.tan(Math.PI / numFaces));
        //this.radius *= 1.15;
        //this.radius = radius;
        //console.log(this.template.querySelector('.face').offsetHeight, radius);
        //this.wheel.style.transform = 'translate(-50% -25%) translateZ(-'+ radius +'px)';
        //this.wheel.style.transform = 'translateZ(-'+ radius +'px)';
        //console.log('wheel transform = '+ this.wheel.style.transform, this.wheel.style.top, this.wheel.style.left);
        let i = 0;
        for (let face of this.template.querySelectorAll('.face')) {
            //let radius = Math.round((face.clientHeight / 2) / Math.tan(Math.PI / numFaces));
            //console.log(this.wheel.offsetHeight / 2, face.offsetHeight / 2);
            //face.style.left = this.wheel.offsetWidth / 2 - face.offsetWidth / 2;
            face.style.transform = 'translateX(-50%) translateY(-50%) rotateX('+ theta * i +'deg) translateZ('+ this.radius +'px)';
            //console.log(i +': '+ face.offsetHeight, face.clientHeight, face.style.transform);
            //this.faces[i].label = face.style.transform;
            i++;
        }
        console.log('finished setting faces');
        requestAnimationFrame(timestamp => {
            this.spinFace(timestamp);
        });
    }

    spinFace(timestamp) {
        //this.wheel.style.transform = 'translateZ(-'+ this.radius +'px) rotateX(' + ((parseFloat(this.getTransformValue(this.wheel, 'rotateX('), 10) % 360) - this.speed) + 'deg)';
        //this.wheel.style.top = '75%';
        //this.wheel.style.transform = 'translate3d(-50%, 300px, -'+ this.radius +'px) rotateX(' + ((parseFloat(this.getTransformValue(this.wheel, 'rotateX('), 10) % 360) - this.speed) + 'deg)';
        this.deg -= this.speed;
        this.wheel.style.transform = 'translateZ(-'+ this.radius +'px) rotateX(' + this.deg % 360 + 'deg)';
        this.speed *= 0.99;
        if (this.speed > 0.1) {
            requestAnimationFrame(timestamp => {
                this.spinFace(timestamp);
            });
        }
    }

    // Don't really need this if we're just tracking a global deg 
    getTransformValue(el, rotateFn) {
        let transform = el.style.transform;
        let fromIndex = transform.indexOf(rotateFn) + rotateFn.length;
        let value = transform.substring(fromIndex, transform.indexOf(CLOSE_PAREN, fromIndex));
        //console.log('in getTransformValue: transform = ' + transform, 'value = ' + value, 'fromIndex = ' + fromIndex);
        if (!value) {
            return 0;
        }
        return value;
    }

    increaseSpeed() {
        this.speed++;
    }

    decreaseSpeed() {
        this.speed--;
    }
}